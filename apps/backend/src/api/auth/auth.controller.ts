import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../domain/user/services/auth.service';
import { EmailVerificationService } from '../../domain/user/services/email-verification.service';
import { PasswordResetService } from '../../domain/user/services/password-reset.service';
import { TokenService } from '../../domain/user/services/token.service';
import { SessionService } from '../../domain/user/services/session.service';
import { validateData } from '../../utils/validation';
import {
  LoginSchema,
  LoginInput,
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
    private readonly passwordResetService: PasswordResetService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService
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

      // 3. Delegate tokens and session response creation
      const userAgent = req.headers['user-agent'] || null;
      const ipAddress = req.ip || null;
      const tokenResponse = await this.tokenService.generateAuthResponse(
        userWithProfile,
        null, // deviceName placeholder
        ipAddress,
        userAgent
      );

      // 4. Return standardized API success response
      res.status(200).json({
        status: 200,
        message: 'User logged in successfully',
        data: tokenResponse,
      });
    } catch (err) {
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

      const { wasAlreadyVerified } = await this.emailVerificationService.verify(token);

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

  /**
   * HTTP Handler for token refresh rotation.
   * Exposes POST /api/v1/auth/refresh.
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({
          status: 400,
          error: 'Bad Request',
          message: 'Refresh token is required.',
        });
        return;
      }

      const userAgent = req.headers['user-agent'] || null;
      const ipAddress = req.ip || null;
      const response = await this.tokenService.refreshSession(refreshToken, null, ipAddress, userAgent);

      res.status(200).json({
        status: 200,
        message: 'Token refreshed successfully.',
        data: response,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * HTTP Handler for user logout.
   * Exposes POST /api/v1/auth/logout.
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      await this.tokenService.logout(refreshToken);

      res.status(200).json({
        status: 200,
        message: 'Logged out successfully.',
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * HTTP Handler for listing active sessions.
   * Exposes GET /api/v1/auth/sessions (Protected by jwtGuard).
   */
  getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const currentSessionId = req.sessionId;
      const activeSessions = await this.sessionService.findActiveSessions(user.id);

      const formattedSessions = activeSessions.map((session) => ({
        id: session.id,
        device: session.deviceName || session.userAgent || 'Unknown Device',
        createdAt: session.issuedAt,
        lastUsedAt: session.lastUsedAt,
        isCurrent: session.id === currentSessionId,
      }));

      res.status(200).json({
        status: 200,
        message: 'Active sessions retrieved successfully.',
        data: formattedSessions,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * HTTP Handler for revoking a specific session.
   * Exposes DELETE /api/v1/auth/sessions/:id (Protected by jwtGuard).
   */
  revokeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const sessionId = req.params.id;

      // 1. Fetch target session
      const session = await this.sessionService.findSessionById(sessionId);
      if (!session || session.revokedAt !== null) {
        res.status(404).json({
          status: 404,
          error: 'Not Found',
          message: 'Session not found.',
        });
        return;
      }

      // 2. Prevent users from revoking sessions belonging to other users
      if (session.userId !== user.id) {
        res.status(403).json({
          status: 403,
          error: 'Forbidden',
          message: 'You are not authorized to revoke this session.',
        });
        return;
      }

      // 3. Revoke
      await this.sessionService.revokeSession(sessionId);

      res.status(200).json({
        status: 200,
        message: 'Session revoked successfully.',
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * HTTP Handler for revoking all sessions except the current one.
   * Exposes DELETE /api/v1/auth/sessions (Protected by jwtGuard).
   */
  revokeAllOtherSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const currentSessionId = req.sessionId;

      if (!currentSessionId) {
        res.status(400).json({
          status: 400,
          error: 'Bad Request',
          message: 'Current session ID could not be identified.',
        });
        return;
      }

      await this.sessionService.revokeAllOtherSessions(user.id, currentSessionId);

      res.status(200).json({
        status: 200,
        message: 'All other sessions revoked successfully.',
      });
    } catch (err) {
      next(err);
    }
  };
}
