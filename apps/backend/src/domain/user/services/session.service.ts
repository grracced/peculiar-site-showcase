import crypto from 'crypto';
import { ISessionRepository } from '../session.repository';
import { UserSession } from '../user-session.entity';
import { logger } from '../../../utils/logger';

export class SessionService {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  /**
   * Securely hashes a token using SHA-256 to ensure plaintext tokens are never stored.
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Initializes a session inside the database under token hash.
   */
  async createSession(
    userId: string,
    plaintextRefreshToken: string,
    expiresAt: Date,
    deviceName: string | null = null,
    ipAddress: string | null = null,
    userAgent: string | null = null
  ): Promise<UserSession> {
    const tokenHash = this.hashToken(plaintextRefreshToken);

    logger.debug({ userId, expiresAt }, 'Creating new user session');
    const session = await this.sessionRepository.create({
      userId,
      tokenHash,
      expiresAt,
      deviceName,
      ipAddress,
      userAgent,
    });

    logger.info({ sessionId: session.id, userId }, 'Session created successfully');
    return session;
  }

  /**
   * Finds a session by its unique ID.
   */
  async findSessionById(id: string): Promise<UserSession | null> {
    return this.sessionRepository.findById(id);
  }

  /**
   * Rotates an active session's refresh token hash during rotation.
   */
  async rotateSession(
    sessionId: string,
    newPlaintextRefreshToken: string,
    expiresAt: Date
  ): Promise<void> {
    const tokenHash = this.hashToken(newPlaintextRefreshToken);

    logger.debug({ sessionId }, 'Rotating session token hash');
    await this.sessionRepository.updateSession(sessionId, {
      tokenHash,
      lastUsedAt: new Date(),
    });

    logger.info({ sessionId }, 'Session token rotated successfully');
  }

  /**
   * Revokes a specific session by ID.
   */
  async revokeSession(sessionId: string): Promise<void> {
    logger.info({ sessionId }, 'Revoking session');
    await this.sessionRepository.revoke(sessionId, new Date());
  }

  /**
   * Revokes all active sessions for a user, except the current one.
   */
  async revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    logger.info({ userId, currentSessionId }, 'Revoking all other sessions for user');
    await this.sessionRepository.revokeAllForUser(userId, currentSessionId);
  }

  /**
   * Revokes all active sessions for a user.
   */
  async revokeAllSessions(userId: string): Promise<void> {
    logger.info({ userId }, 'Revoking all sessions for user');
    await this.sessionRepository.revokeAllForUser(userId);
  }

  /**
   * Retrieves all active sessions for a user.
   */
  async findActiveSessions(userId: string): Promise<UserSession[]> {
    return this.sessionRepository.findActiveByUserId(userId);
  }
}
