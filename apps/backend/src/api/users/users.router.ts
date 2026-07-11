import { Router } from 'express';
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory-user.repository';
import { RegistrationService } from '../../domain/user/services/registration.service';
import { EmailVerificationService } from '../../domain/user/services/email-verification.service';
import { MockEmailService } from '../../infrastructure/email/mock-email.service';
import { UsersController } from './users.controller';

const usersRouter = Router();

// 1. Instantiate the dependencies (Clean Architecture Composition Root for /users)
const userRepository = new InMemoryUserRepository();
const emailVerificationService = new EmailVerificationService(userRepository);
const emailService = new MockEmailService();
const registrationService = new RegistrationService(userRepository, emailVerificationService, emailService);
const usersController = new UsersController(registrationService);

// 2. Map endpoints to handlers
usersRouter.post('/', usersController.register);

export { usersRouter };
