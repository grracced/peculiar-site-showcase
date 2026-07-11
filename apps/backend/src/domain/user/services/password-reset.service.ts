import crypto from 'crypto';
import { IUserRepository } from '../user.repository';
import { ISessionRepository } from '../session.repository';
import { IEmailService } from './email.interface';
import { hashPassword, verifyPassword } from '../../../utils/password';
import { logger } from '../../../utils/logger';
import { SecurityAuditLogger, SecurityEvent } from '../../../utils/auditLogger';
import { InvalidTokenError, ExpiredTokenError } from './email-verification.service';

export class PasswordReuseError extends Error {
  constructor() {
    super('Password has been used recently and cannot be reused');
    this.name = 'PasswordReuseError';
  }
}

export class PasswordResetService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly sessionRepository: ISessionRepository
  ) {}

  /**
   * Orchestrates the password reset request flow.
   * Generates a cryptographically secure token, hashes it, saves the hash/expiry,
   * and sends an email.
   *
   * Crucially, this always resolves successfully to the caller to prevent email enumeration attacks.
   *
   * @param email - Recipient email.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    logger.info({ email: normalizedEmail }, 'Password reset request received');

    // 1. Find user by email
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      // Log internally but do not fail to avoid email enumeration
      logger.info({ email: normalizedEmail }, 'Password reset requested for unregistered email address');
      return;
    }

    // 2. Generate cryptographically secure token
    const plaintextToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(plaintextToken);

    // 3. Set expiration (default: 1 hour)
    const expirationHours = Number(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN_HOURS || 1);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    // 4. Save to database
    await this.userRepository.updatePasswordResetToken(user.id, tokenHash, expiresAt);

    // 5. Send password reset email
    const appUrl = process.env.APP_URL || 'https://getverifai.me';
    const resetLink = `${appUrl}/reset-password?token=${plaintextToken}`;

    logger.debug({ userId: user.id }, 'Sending password reset email');
    await this.emailService.sendPasswordResetEmail(user.email, resetLink);

    logger.info({ userId: user.id, expiresAt }, 'Password reset token generated and sent successfully');
    SecurityAuditLogger.log({ event: SecurityEvent.PASSWORD_RESET_REQUESTED, userId: user.id, email: user.email });
  }

  /**
   * Resets the user's password using a verification token.
   *
   * @param plaintextToken - The token sent in the email.
   * @param newPassword - New password to set.
   * @throws {InvalidTokenError} If the token does not match any user record.
   * @throws {ExpiredTokenError} If the token expiration window has elapsed.
   */
  async resetPassword(plaintextToken: string, newPassword: string): Promise<void> {
    if (!plaintextToken) {
      logger.warn('Password reset failed: Empty token provided');
      throw new InvalidTokenError();
    }

    const tokenHash = this.hashToken(plaintextToken);

    // 1. Find user by hashed token
    const user = await this.userRepository.findByPasswordResetTokenHash(tokenHash);
    if (!user) {
      logger.warn('Password reset failed: Unmatched token hash');
      throw new InvalidTokenError();
    }

    // 2. Expiration check
    const expiresAt = await this.userRepository.getPasswordResetExpiry(user.id);
    if (expiresAt && expiresAt < new Date()) {
      logger.warn({ userId: user.id, expiresAt }, 'Password reset failed: Expired token');
      throw new ExpiredTokenError();
    }

    // 2.1 Password reuse prevention check (Argon2 historical hash compare)
    const history = await this.userRepository.getPasswordHistory(user.id);
    for (const historicalHash of history) {
      if (await verifyPassword(historicalHash, newPassword)) {
        logger.warn({ userId: user.id }, 'Password reset failed: Password reuse detected');
        throw new PasswordReuseError();
      }
    }

    // 3. Hash the new password using Argon2
    const passwordHash = await hashPassword(newPassword);

    // 4. Update the user's password and clear token fields
    await this.userRepository.resetPassword(user.id, passwordHash, new Date());

    // 4.1 Log the new password hash into history
    await this.userRepository.addPasswordHistoryEntry(user.id, passwordHash);

    // 5. Invalidate all active user sessions
    await this.sessionRepository.revokeAllForUser(user.id);
    logger.info({ userId: user.id }, 'Password reset executed successfully. All active sessions revoked.');
    SecurityAuditLogger.log({ event: SecurityEvent.PASSWORD_CHANGED, userId: user.id });
  }

  /**
   * Helper to format a token into a SHA-256 hash.
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
