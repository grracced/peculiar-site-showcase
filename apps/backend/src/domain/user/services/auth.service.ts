import { IUserRepository } from '../user.repository';
import { UserWithProfile } from '../user.entity';
import { LoginInput } from '../user.schema';
import { verifyPassword } from '../../../utils/password';
import { AccountStatus } from '../user.enums';
import { logger } from '../../../utils/logger';

/**
 * Domain-level exception thrown on authentication failure.
 * Returns a generic message to prevent username/email enumeration attacks.
 */
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

/**
 * Domain-level exception thrown when a user attempts to log in
 * before verifying their email address.
 */
export class EmailNotVerifiedError extends Error {
  constructor() {
    super('Email address has not been verified');
    this.name = 'EmailNotVerifiedError';
  }
}

/**
 * Domain-level exception thrown when a suspended user tries to log in.
 */
export class AccountSuspendedError extends Error {
  constructor() {
    super('Account has been suspended');
    this.name = 'AccountSuspendedError';
  }
}

/**
 * Domain Service handling core user authentication business logic.
 */
export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Authenticate a user by verifying their email and password.
   *
   * @param input - Normalised email and plain text password.
   * @returns The authenticated UserWithProfile entity.
   * @throws {InvalidCredentialsError} For incorrect email/password.
   * @throws {EmailNotVerifiedError} If email is unverified.
   * @throws {AccountSuspendedError} If the account is suspended.
   */
  async login(input: LoginInput): Promise<UserWithProfile> {
    const email = input.email.toLowerCase().trim();

    logger.debug({ email }, 'Attempting login');

    // 1. Look up user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      logger.warn({ email }, 'Login failed: Email not found');
      throw new InvalidCredentialsError();
    }

    // 2. Look up the stored password hash from the DB.
    const passwordHash = await this.userRepository.getPasswordHashByEmail(email);
    if (!passwordHash) {
      logger.warn({ email, userId: user.id }, 'Login failed: Password hash missing in store');
      throw new InvalidCredentialsError();
    }

    // 3. Verify password hash using Argon2
    const isValidPassword = await verifyPassword(passwordHash, input.password);
    if (!isValidPassword) {
      logger.warn({ email, userId: user.id }, 'Login failed: Password mismatch');
      throw new InvalidCredentialsError();
    }

    // 4. Enforce status constraints (Reject unverified/suspended accounts)
    if (!user.emailVerified) {
      logger.warn({ email, userId: user.id }, 'Login blocked: Email unverified');
      throw new EmailNotVerifiedError();
    }

    if (user.status === AccountStatus.SUSPENDED) {
      logger.warn({ email, userId: user.id }, 'Login blocked: Account suspended');
      throw new AccountSuspendedError();
    }

    // 5. Fetch user profile
    const userWithProfile = await this.userRepository.findWithProfile(user.id);
    if (!userWithProfile) {
      logger.error({ email, userId: user.id }, 'Login failed: User profile missing');
      throw new Error('User profile missing');
    }

    logger.info(
      {
        email: userWithProfile.email,
        userId: userWithProfile.id,
        role: userWithProfile.role,
        fullName: userWithProfile.profile?.fullName,
      },
      'User logged in successfully'
    );

    return userWithProfile;
  }
}
