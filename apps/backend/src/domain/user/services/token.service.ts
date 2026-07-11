import { JwtService } from './jwt.service';
import { SessionService } from './session.service';
import { IUserRepository } from '../user.repository';
import { ISessionRepository } from '../session.repository';
import { User } from '../user.entity';
import { logger } from '../../../utils/logger';
import { SecurityAuditLogger, SecurityEvent } from '../../../utils/auditLogger';
import { InvalidTokenError, ExpiredTokenError } from './email-verification.service';

export interface AuthTokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: {
    userId: string;
    email: string;
    fullName: string;
    role: string;
    emailVerified: boolean;
  };
}

export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository
  ) {}

  /**
   * Generates a fully formatted Auth Token DTO response,
   * initializing a new session entry in the database.
   */
  async generateAuthResponse(
    user: User,
    deviceName: string | null = null,
    ipAddress: string | null = null,
    userAgent: string | null = null
  ): Promise<AuthTokenResponseDto> {
    logger.debug({ userId: user.id }, 'Generating access & refresh tokens');

    // 1. Fetch user profile for full name mapping
    const userWithProfile = await this.userRepository.findWithProfile(user.id);
    const fullName = userWithProfile?.profile?.fullName ?? '';

    // 2. Generate Refresh Token
    const refreshToken = this.jwtService.signRefreshToken({
      userId: user.id,
    });

    // 3. Save session using refresh token expiry
    const refreshExpiresHours = Number(process.env.JWT_REFRESH_EXPIRES_IN_HOURS || 168); // default 7 days in hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + refreshExpiresHours);

    const session = await this.sessionService.createSession(
      user.id,
      refreshToken,
      expiresAt,
      deviceName,
      ipAddress,
      userAgent
    );

    // 4. Generate Access Token containing sessionId
    const { token: accessToken, expiresInSeconds } = this.jwtService.signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: expiresInSeconds,
      tokenType: 'Bearer',
      user: {
        userId: user.id,
        email: user.email,
        fullName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  /**
   * Refreshes an active session, rotating the refresh token.
   */
  async refreshSession(
    plaintextRefreshToken: string,
    deviceName: string | null = null,
    ipAddress: string | null = null,
    userAgent: string | null = null
  ): Promise<AuthTokenResponseDto> {
    logger.info('Received token refresh request');

    // 1. Verify payload formatting/expiration
    let payload;
    try {
      payload = this.jwtService.verifyRefreshToken(plaintextRefreshToken);
    } catch (err) {
      logger.warn('Token refresh failed: Invalid/Expired JWT structure');
      SecurityAuditLogger.log({ event: SecurityEvent.INVALID_REFRESH_TOKEN, metadata: { reason: 'jwt_verification_failed' } });
      throw new InvalidTokenError();
    }

    // 2. Check token hash against database
    const tokenHash = this.sessionService.hashToken(plaintextRefreshToken);
    const session = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!session || session.revokedAt !== null) {
      logger.warn({ tokenHash }, 'Token refresh failed: Revoked or missing session hash');
      SecurityAuditLogger.log({ event: SecurityEvent.INVALID_REFRESH_TOKEN, metadata: { reason: 'revoked_or_missing_session' } });
      throw new InvalidTokenError();
    }

    // 3. Check expiration timestamp on session
    if (session.expiresAt < new Date()) {
      logger.warn({ sessionId: session.id }, 'Token refresh failed: Session expired');
      throw new ExpiredTokenError();
    }

    // 4. Find user and check status blockades
    const user = await this.userRepository.findById(session.userId);
    if (!user || user.status !== 'ACTIVE' || !user.emailVerified) {
      logger.warn({ userId: session.userId }, 'Token refresh failed: Blocked/Inactive user status');
      throw new InvalidTokenError();
    }

    // 5. Generate new Refresh Token
    const newRefreshToken = this.jwtService.signRefreshToken({
      userId: user.id,
    });

    // 6. Rotate token hash (update hash & lastUsedAt)
    const refreshExpiresHours = Number(process.env.JWT_REFRESH_EXPIRES_IN_HOURS || 168);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + refreshExpiresHours);

    await this.sessionService.rotateSession(session.id, newRefreshToken, expiresAt);

    // 7. Generate Access Token containing rotated sessionId
    const { token: accessToken, expiresInSeconds } = this.jwtService.signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    });

    const userWithProfile = await this.userRepository.findWithProfile(user.id);
    const fullName = userWithProfile?.profile?.fullName ?? '';

    logger.info({ sessionId: session.id }, 'Token session rotated successfully');

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: expiresInSeconds,
      tokenType: 'Bearer',
      user: {
        userId: user.id,
        email: user.email,
        fullName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  /**
   * Revokes the session associated with the refresh token.
   */
  async logout(plaintextRefreshToken: string): Promise<void> {
    if (!plaintextRefreshToken) {
      logger.warn('Logout failed: Empty token');
      throw new InvalidTokenError();
    }

    const tokenHash = this.sessionService.hashToken(plaintextRefreshToken);
    const session = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!session || session.revokedAt !== null) {
      logger.warn('Logout failed: Session not active or missing');
      return; // Return silently to prevent user discovery/leakage
    }

    await this.sessionService.revokeSession(session.id);
    logger.info({ sessionId: session.id }, 'User logged out successfully');
  }
}
