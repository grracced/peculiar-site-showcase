import { IEmailService } from '../../domain/user/services/email.interface';
import { logger } from '../../utils/logger';

/**
 * Mock implementation of the IEmailService.
 * Logs verification link details instead of executing network SMTP/API requests.
 */
export class MockEmailService implements IEmailService {
  async sendVerificationEmail(email: string, link: string): Promise<void> {
    logger.info(
      {
        to: email,
        subject: 'Verify your VerifAI email address',
        verificationLink: link,
      },
      'Mock Email Sent (Details logged above)'
    );
  }

  async sendPasswordResetEmail(email: string, link: string): Promise<void> {
    logger.info(
      {
        to: email,
        subject: 'Reset your VerifAI password',
        resetLink: link,
      },
      'Mock Password Reset Email Sent (Details logged above)'
    );
  }
}
