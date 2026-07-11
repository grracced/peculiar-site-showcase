import crypto from 'crypto';
import { IUserRepository } from '../user.repository';
import { User } from '../user.entity';
import { logger } from '../../../utils/logger';

/**
 * Domain exception thrown when the verification token does not match any user record.
 */
export class InvalidTokenError extends Error {
  constructor() {
    super('The verification link is invalid.');
    this.name = 'InvalidTokenError';
  }
}

/**
 * Domain exception thrown when the verification token expiration window has lapsed.
 */
export class ExpiredTokenError extends Error {
  constructor() {
    super('The verification link has expired.');
    this.name = 'ExpiredTokenError';
  }
}

export class EmailVerificationService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Generates a cryptographically secure token, hashes it,
   * saves it in the database with a 24-hour expiration window,
   * and returns the plaintext token.
   *
   * @param userId - The user ID to generate the token for.
   * @returns Plaintext cryptographically secure token.
   */
  async generateAndSaveToken(userId: string): Promise<string> {
    logger.debug({ userId }, 'Generating email verification token');

    // 1. Generate secure token
    const plaintextToken = crypto.randomBytes(32).toString('hex');

    // 2. Hash token using SHA-256
    const tokenHash = this.hashToken(plaintextToken);

    // 3. Set expiration date (default 24 hours)
    const expirationHours = Number(process.env.VERIFICATION_TOKEN_EXPIRES_IN_HOURS || 24);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    // 4. Save to database
    await this.userRepository.updateVerificationToken(userId, tokenHash, expiresAt);

    logger.info({ userId, expiresAt }, 'Verification token hash and expiry stored successfully');
    
    return plaintextToken;
  }

  /**
   * Validates a plaintext verification token, marking the user's email as verified.
   *
   * @param plaintextToken - The token retrieved from the verification link query parameters.
   * @returns The updated User entity on success.
   * @throws {InvalidTokenError} If the token does not match any user.
   * @throws {ExpiredTokenError} If the token expiration timestamp is in the past.
   */
  async verify(plaintextToken: string): Promise<{ user: User; wasAlreadyVerified: boolean }> {
    if (!plaintextToken) {
      logger.warn('Email verification failed: Empty token provided');
      throw new InvalidTokenError();
    }

    const tokenHash = this.hashToken(plaintextToken);

    // 1. Find user by hashed token
    const user = await this.userRepository.findByVerificationTokenHash(tokenHash);
    if (!user) {
      logger.warn('Email verification failed: Unmatched token hash');
      throw new InvalidTokenError();
    }

    // 2. If user is already verified (already handled, but safety check)
    if (user.emailVerified) {
      logger.info({ userId: user.id }, 'Email verification duplicate attempt: Already verified');
      return { user, wasAlreadyVerified: true };
    }

    // 3. Expiration check
    const expiresAt = await this.userRepository.getVerificationExpiry(user.id);

    if (expiresAt && expiresAt < new Date()) {
      logger.warn({ userId: user.id, expiresAt }, 'Email verification failed: Expired token');
      throw new ExpiredTokenError();
    }

    // 4. Mark email as verified
    const verifiedUser = await this.userRepository.verifyEmail(user.id, new Date());
    
    logger.info({ userId: verifiedUser.id }, 'Email verified successfully');
    
    return { user: verifiedUser, wasAlreadyVerified: false };
  }

  /**
   * Helper to format a token into a SHA-256 hash.
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
