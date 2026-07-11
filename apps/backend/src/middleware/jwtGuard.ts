import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../domain/user/services/jwt.service';
import { InMemoryUserRepository } from '../infrastructure/repositories/in-memory-user.repository';
import { logger } from '../utils/logger';
import { SecurityAuditLogger, SecurityEvent } from '../utils/auditLogger';

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
      SecurityAuditLogger.log({ event: SecurityEvent.INVALID_JWT, correlationId: correlationId as string, ipAddress: req.ip || undefined, metadata: { reason: 'missing_or_invalid_header' } });
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
      SecurityAuditLogger.log({ event: SecurityEvent.INVALID_JWT, correlationId: correlationId as string, ipAddress: req.ip || undefined, metadata: { reason: err.name || 'token_verification_failed' } });
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
      SecurityAuditLogger.log({ event: SecurityEvent.PERMISSION_DENIED, userId: payload.userId, correlationId: correlationId as string, metadata: { reason: 'inactive_or_unverified_account', userStatus: user?.status } });
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
