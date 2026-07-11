/**
 * Represents an active user authentication session (corresponds to a issued refresh token).
 */
export interface UserSession {
  /** UUID primary key. */
  readonly id: string;

  /** Foreign key pointing to the user this session belongs to. */
  readonly userId: string;

  /** Secure SHA-256 hash of the rotating refresh token. */
  readonly tokenHash: string;

  /** Timestamp of when the session was created. */
  readonly issuedAt: Date;

  /** Timestamp when this session's refresh token will expire. */
  readonly expiresAt: Date;

  /** Timestamp when this session was manually revoked, or null if active. */
  readonly revokedAt: Date | null;

  /** Timestamp of last activity using this session. */
  readonly lastUsedAt: Date;

  /** Operating system / device name placeholder. */
  readonly deviceName: string | null;

  /** The IP address used to initialize/use the session. */
  readonly ipAddress: string | null;

  /** User Agent string of the client device. */
  readonly userAgent: string | null;
}
