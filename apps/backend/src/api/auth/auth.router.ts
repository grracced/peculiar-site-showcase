import { Router } from 'express';
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory-user.repository';
import { AuthService } from '../../domain/user/services/auth.service';
import { AuthController } from './auth.controller';

const authRouter = Router();

// composition root for /auth
const userRepository = new InMemoryUserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

authRouter.post('/login', authController.login);

export { authRouter };
