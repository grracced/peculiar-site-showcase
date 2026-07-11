/**
 * Represents a history log of previously used passwords for reuse prevention.
 */
export interface PasswordHistory {
  /** UUID primary key. */
  readonly id: string;

  /** Foreign key pointing to the user this history entry belongs to. */
  readonly userId: string;

  /** Secure hash of the password. */
  readonly passwordHash: string;

  /** Timestamp of when the password history entry was recorded. */
  readonly createdAt: Date;
}
