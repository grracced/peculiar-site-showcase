import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logger } from '../../../utils/logger';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion?: number; // Hook for future revocation/versioning features
  jti?: string;
}

export class JwtService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';

    // Defense-in-depth: Even though env.ts validates at startup,
    // JwtService enforces its own guard to prevent signing with dev defaults.
    if (isProduction && !process.env.JWT_SECRET) {
      throw new Error('CRITICAL: JWT_SECRET must be set in production');
    }
    if (isProduction && !process.env.JWT_REFRESH_SECRET) {
      throw new Error('CRITICAL: JWT_REFRESH_SECRET must be set in production');
    }

    if (!isProduction && !process.env.JWT_SECRET) {
      logger.warn('JWT_SECRET not set. Using development-only fallback key.');
    }
    if (!isProduction && !process.env.JWT_REFRESH_SECRET) {
      logger.warn('JWT_REFRESH_SECRET not set. Using development-only fallback key.');
    }

    this.jwtSecret = process.env.JWT_SECRET || 'dev_jwt_access_secret_key_123!';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_key_456!';
    this.accessExpiresIn = process.env.JWT_EXPIRES_IN || '15m'; // default 15 minutes
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // default 7 days
  }

  /**
   * Signs a new JWT Access Token containing core user identities.
   */
  signAccessToken(payload: AccessTokenPayload): { token: string; expiresInSeconds: number } {
    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessExpiresIn as any,
    });
    
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const expiresInSeconds = decoded.exp && decoded.iat ? decoded.exp - decoded.iat : 900;

    return { token, expiresInSeconds };
  }

  /**
   * Signs a rotating JWT Refresh Token.
   */
  signRefreshToken(payload: RefreshTokenPayload): string {
    const extendedPayload = {
      ...payload,
      jti: crypto.randomUUID(),
    };
    return jwt.sign(extendedPayload, this.jwtRefreshSecret, {
      expiresIn: this.refreshExpiresIn as any,
    });
  }

  /**
   * Verifies an Access Token payload.
   *
   * @throws {jwt.JsonWebTokenError} on signature issues.
   * @throws {jwt.TokenExpiredError} on expiration.
   */
  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as AccessTokenPayload;
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Access token verification failed');
      throw err;
    }
  }

  /**
   * Verifies a Refresh Token payload.
   *
   * @throws {jwt.JsonWebTokenError} on signature issues.
   * @throws {jwt.TokenExpiredError} on expiration.
   */
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, this.jwtRefreshSecret) as RefreshTokenPayload;
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Refresh token verification failed');
      throw err;
    }
  }
}
