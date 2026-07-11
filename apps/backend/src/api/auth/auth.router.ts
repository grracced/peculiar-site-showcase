import { Router } from 'express';
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory-user.repository';
import { InMemorySessionRepository } from '../../infrastructure/repositories/in-memory-session.repository';
import { AuthService } from '../../domain/user/services/auth.service';
import { EmailVerificationService } from '../../domain/user/services/email-verification.service';
import { PasswordResetService } from '../../domain/user/services/password-reset.service';
import { MockEmailService } from '../../infrastructure/email/mock-email.service';
import { JwtService } from '../../domain/user/services/jwt.service';
import { SessionService } from '../../domain/user/services/session.service';
import { TokenService } from '../../domain/user/services/token.service';
import { AuthController } from './auth.controller';
import { jwtGuard } from '../../middleware/jwtGuard';

const authRouter = Router();

// composition root for /auth
const userRepository = new InMemoryUserRepository();
const sessionRepository = new InMemorySessionRepository();

const authService = new AuthService(userRepository);
const emailVerificationService = new EmailVerificationService(userRepository);
const emailService = new MockEmailService();

const jwtService = new JwtService();
const sessionService = new SessionService(sessionRepository);
const tokenService = new TokenService(jwtService, sessionService, userRepository, sessionRepository);
const passwordResetService = new PasswordResetService(userRepository, emailService, sessionRepository);

const authController = new AuthController(
  authService,
  emailVerificationService,
  passwordResetService,
  tokenService,
  sessionService
);

authRouter.post('/login', authController.login);
authRouter.get('/verify-email', authController.verifyEmail);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/sessions', jwtGuard, authController.getSessions);
authRouter.delete('/sessions', jwtGuard, authController.revokeAllOtherSessions);
authRouter.delete('/sessions/:id', jwtGuard, authController.revokeSession);

export { authRouter };
