import { UserSession } from './user-session.entity';

export interface ISessionRepository {
  /**
   * Creates a new user session entry in the database.
   */
  create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    deviceName: string | null;
    ipAddress: string | null;
    userAgent: string | null;
  }): Promise<UserSession>;

  /**
   * Finds a session by its unique SHA-256 token hash.
   */
  findByTokenHash(tokenHash: string): Promise<UserSession | null>;

  /**
   * Finds a session by its primary UUID.
   */
  findById(id: string): Promise<UserSession | null>;

  /**
   * Updates an existing session's token hash (during rotation) and updates lastUsedAt.
   */
  updateSession(id: string, data: { tokenHash: string; lastUsedAt: Date }): Promise<void>;

  /**
   * Revokes a session by setting revokedAt to the current timestamp.
   */
  revoke(id: string, date: Date): Promise<void>;

  /**
   * Revokes all active sessions for a user, with an optional exclusion of a current session ID.
   */
  revokeAllForUser(userId: string, excludeSessionId?: string): Promise<void>;

  /**
   * Finds all active (non-revoked, non-expired) sessions for a user.
   */
  findActiveByUserId(userId: string): Promise<UserSession[]>;
}
