import { IUserRepository } from '../user.repository';
import { UserWithProfile } from '../user.entity';
import { UserRegistrationSchema } from '../user.schema';
import { hashPassword } from '../../../utils/password';
import { logger } from '../../../utils/logger';

/**
 * Domain-level exception thrown when attempting to register a user with an email
 * that is already registered in the system.
 */
export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`The email address "${email}" is already registered.`);
    this.name = 'EmailAlreadyExistsError';
  }
}

export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Service to handle the user registration use-case.
 * Enforces business rules (uniqueness check, hashing, transactions) at the domain layer.
 */
export class RegistrationService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Register a new user and generate their profile.
   *
   * @param dto - Validated registration details.
   * @returns The newly created user composite with profile.
   * @throws {EmailAlreadyExistsError} if email is already in use.
   */
  async register(dto: RegisterUserDto): Promise<UserWithProfile> {
    // 1. Perform validation via schema
    const validated = UserRegistrationSchema.parse(dto);

    logger.debug({ email: validated.email }, 'Checking if email is already registered');

    // 2. Uniqueness check
    const existingUser = await this.userRepository.findByEmail(validated.email);
    if (existingUser) {
      logger.warn({ email: validated.email }, 'Registration rejected: Email already exists');
      throw new EmailAlreadyExistsError(validated.email);
    }

    // 3. Hash the password securely
    logger.debug({ email: validated.email }, 'Hashing password');
    const passwordHash = await hashPassword(validated.password);

    // 4. Transactionally create the User and UserProfile
    logger.info({ email: validated.email }, 'Transactionally creating User and UserProfile');
    
    // We delegate the transaction implementation to the repository layer (Prisma transaction)
    const userWithProfile = await this.userRepository.createWithProfile({
      email: validated.email,
      passwordHash,
      firstName: validated.firstName,
      lastName: validated.lastName,
    });

    logger.info({ userId: userWithProfile.id }, 'User registration completed successfully');
    
    return userWithProfile;
  }
}
