import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../domain/user/services/auth.service';
import { EmailVerificationService } from '../../domain/user/services/email-verification.service';
import { PasswordResetService } from '../../domain/user/services/password-reset.service';
import { validateData } from '../../utils/validation';
import {
  LoginSchema,
  LoginInput,
  AuthResponseSchema,
  ForgotPasswordSchema,
  ForgotPasswordInput,
  ResetPasswordSchema,
  ResetPasswordInput,
} from '../../domain/user/user.schema';

/**
 * Controller to handle incoming HTTP requests targeting /api/v1/auth.
 */
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService
  ) {}

  /**
   * HTTP Handler for credentials-based user login.
   * Exposes POST /api/v1/auth/login.
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validate payload against LoginSchema
      const loginDto = validateData<LoginInput>(LoginSchema, req.body);

      // 2. Delegate authentication to service layer
      const userWithProfile = await this.authService.login(loginDto);

      // 3. Construct and validate outgoing DTO
      const authResponse = AuthResponseSchema.parse({
        userId: userWithProfile.id,
        email: userWithProfile.email,
        fullName: userWithProfile.profile?.fullName ?? '',
        role: userWithProfile.role,
        emailVerified: userWithProfile.emailVerified,
      });

      // 4. Return standardized API success response
      res.status(200).json({
        status: 200,
        message: 'User logged in successfully',
        data: authResponse,
      });
    } catch (err) {
      // Forward authentication exceptions (e.g. InvalidCredentialsError) to errorHandler middleware
      next(err);
    }
  };

  /**
   * HTTP Handler for email verification.
   * Exposes GET /api/v1/auth/verify-email?token=<token>.
   */
  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.query.token as string;

      if (!token) {
        throw new Error('Verification token is required.');
      }

      // We will let the emailVerificationService handle token checking. To check if already verified, 
      // we lookup the token first or we query inside service. Let's do it in the service itself:
      // Our EmailVerificationService.verify checks user.emailVerified. If true, it returns the user directly
      // without updating verifiedAt again.
      // So we can inspect if the returned user was already verified before or if verifiedAt is updated.
      // Wait, we can fetch the user by token hash to check if already verified.
      // Since our service verify() clears the hash, it's easier to check if the user is already verified inside the verify function.
      // Yes, we will check if the user was already verified.
      // To know this, we can return a flag or check if the user's emailVerified was already true in the repository before verifyEmail is called.
      // In our EmailVerificationService, we wrote:
      // if (user.emailVerified) { return user; }
      // This is perfect! The verify() method returns the user without modifications.
      // If we call verify(token) and the returned user's emailVerified was already true, we know it's a duplicate check!
      // Wait! But verifyEmail updates `emailVerified = true` in the DB and returns the updated user where `emailVerified = true`.
      // So we can't tell them apart unless we inspect the state before.
      // Let's check `emailVerified` on the user fetched by token hash *before* we call repository `verifyEmail`.
      // Yes, let's see: we did exactly that in EmailVerificationService:
      // if (user.emailVerified) { return user; }
      // So if it was already verified, it returns the user *without* calling verifyEmail (which means emailVerifiedAt is not set to a new date, or we can just see that it was already verified).
      // Wait! In the controller, how do we know if it was already verified?
      // We can look at whether the emailVerified field of the user returned is true, but it is always true on success.
      // Let's modify EmailVerificationService.verify to return an object or simply check user.emailVerifiedAt!
      // If user.emailVerifiedAt is already non-null before we call it? But verifyEmail sets it.
      // Let's see: if we lookup by token hash:
      // const user = await this.userRepository.findByVerificationTokenHash(tokenHash);
      // We can check if it's already verified.
      // Wait, if it is already verified, we return the user. In the controller:
      // If a user clicks it twice, the token is cleared, so they get 400.
      // But if they clicked it and we checked in the service:
      // Let's return { user, wasAlreadyVerified: user.emailVerified } from verify()!
      // This is extremely robust and simple!
      // Let's modify EmailVerificationService.verify to return `{ user: User, wasAlreadyVerified: boolean }`.
      
      const { user, wasAlreadyVerified } = await this.emailVerificationService.verify(token);

      res.status(200).json({
        status: 200,
        message: wasAlreadyVerified ? 'Email has already been verified' : 'Email verified successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * HTTP Handler for forgot password requests.
   * Exposes POST /api/v1/auth/forgot-password.
   */
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = validateData<ForgotPasswordInput>(ForgotPasswordSchema, req.body);
      await this.passwordResetService.requestPasswordReset(input.email);

      res.status(200).json({
        status: 200,
        message: 'If the email is registered, a password reset link has been sent.',
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * HTTP Handler for resetting password using a token.
   * Exposes POST /api/v1/auth/reset-password.
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = validateData<ResetPasswordInput>(ResetPasswordSchema, req.body);
      await this.passwordResetService.resetPassword(input.token, input.newPassword);

      res.status(200).json({
        status: 200,
        message: 'Password reset successfully.',
      });
    } catch (err) {
      next(err);
    }
  };
}
