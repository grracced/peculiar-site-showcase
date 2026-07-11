import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../domain/user/services/jwt.service';
import { InMemoryUserRepository } from '../infrastructure/repositories/in-memory-user.repository';
import { logger } from '../utils/logger';

const jwtService = new JwtService();
const userRepository = new InMemoryUserRepository();

/**
 * Express Middleware Guard to protect authenticated routes using JWT.
 * Extracts the Bearer token from the Authorization header and attaches the user to req.user.
 */
export const jwtGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const correlationId = req.headers['x-correlation-id'] || 'system';

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn({ correlationId }, 'Unauthorized access: Missing or invalid Authorization header format');
      res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'Unauthorized access',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // 1. Verify Access Token
    let payload;
    try {
      payload = jwtService.verifyAccessToken(token);
    } catch (err: any) {
      logger.warn({ correlationId, message: err.message }, 'Unauthorized access: Invalid or expired access token');
      res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'Unauthorized access',
      });
      return;
    }

    // 2. Fetch User from Repository
    const user = await userRepository.findById(payload.userId);
    if (!user || user.status !== 'ACTIVE' || !user.emailVerified) {
      logger.warn(
        { correlationId, userId: payload.userId, userStatus: user?.status, emailVerified: user?.emailVerified },
        'Unauthorized access: User account is inactive, unverified, or does not exist'
      );
      res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'Unauthorized access',
      });
      return;
    }

    // 3. Mount User Context onto request
    req.user = user;
    req.sessionId = payload.sessionId;
    next();
  } catch (err) {
    next(err);
  }
};
