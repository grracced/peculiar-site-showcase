import { Router } from 'express';
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory-user.repository';
import { AuthService } from '../../domain/user/services/auth.service';
import { EmailVerificationService } from '../../domain/user/services/email-verification.service';
import { PasswordResetService } from '../../domain/user/services/password-reset.service';
import { MockEmailService } from '../../infrastructure/email/mock-email.service';
import { AuthController } from './auth.controller';

const authRouter = Router();

// composition root for /auth
const userRepository = new InMemoryUserRepository();
const authService = new AuthService(userRepository);
const emailVerificationService = new EmailVerificationService(userRepository);
const emailService = new MockEmailService();
const passwordResetService = new PasswordResetService(userRepository, emailService);
const authController = new AuthController(authService, emailVerificationService, passwordResetService);

authRouter.post('/login', authController.login);
authRouter.get('/verify-email', authController.verifyEmail);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword);

export { authRouter };
