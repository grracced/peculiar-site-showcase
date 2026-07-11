/**
 * Email Service Interface
 *
 * Defines the business layer abstraction for sending emails.
 * Separating the interface from its direct email transmission engines (e.g. SMTP, Resend, SES)
 * ensures we follow the Dependency Inversion Principle.
 */
export interface IEmailService {
  /**
   * Send a verification email containing a confirm link.
   *
   * @param email - Recipient email.
   * @param link - The secure verification URL.
   */
  sendVerificationEmail(email: string, link: string): Promise<void>;

  /**
   * Send a password reset email containing a reset link.
   *
   * @param email - Recipient email.
   * @param link - The password reset URL.
   */
  sendPasswordResetEmail(email: string, link: string): Promise<void>;
}
