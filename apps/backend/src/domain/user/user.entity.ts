/**
 * User Domain Entities
 *
 * These interfaces define the shape of the User and UserProfile domain objects.
 * They are the internal representation of the data, independent of any ORM or
 * database library. Business logic and services should depend on these types,
 * not on Prisma-generated types directly.
 *
 * Source of Truth: VerifAI_Database_Design.md (Tables: Users, User Profiles)
 */

import { UserRole, AccountStatus, SubscriptionTier } from './user.enums';

/**
 * Represents a VerifAI user account.
 *
 * This maps to the `users` table. Authentication (password_hash) is managed
 * internally by Supabase Auth and is never surfaced in application code.
 */
export interface User {
  /** UUID primary key. */
  readonly id: string;

  /** The user's unique email address. Used as the primary login identifier. */
  readonly email: string;

  /** The user's assigned role. Defaults to USER at registration. */
  readonly role: UserRole;

  /** The operational state of this account. */
  readonly status: AccountStatus;

  /** Whether the user has confirmed their email address. */
  readonly emailVerified: boolean;

  /** Timestamp when the account was created. */
  readonly createdAt: Date;

  /** Timestamp of the last update to the account record. */
  readonly updatedAt: Date;

  /**
   * Soft-delete timestamp. When set, the account is considered deleted.
   * The row is NEVER physically removed from the database to preserve
   * referential integrity with audit logs and verification records.
   */
  readonly deletedAt: Date | null;
}

/**
 * Represents the application-specific profile for a user.
 *
 * This is a 1:1 extension of the User entity (Users -> User Profiles),
 * decoupling auth data from presentational/billing data.
 * Maps to the `user_profiles` table.
 */
export interface UserProfile {
  /** UUID primary key. */
  readonly id: string;

  /** Foreign key reference to Users.id. */
  readonly userId: string;

  /** The user's display name. Nullable until set by the user. */
  readonly fullName: string | null;

  /** URL to the user's avatar image stored in Supabase Storage. Nullable. */
  readonly avatarUrl: string | null;

  /** The user's current billing plan. Defaults to FREE. */
  readonly subscriptionTier: SubscriptionTier;

  /** Timestamp when the profile was created. */
  readonly createdAt: Date;

  /** Timestamp of the last update to the profile record. */
  readonly updatedAt: Date;
}

/**
 * A composite view of a User and their associated Profile.
 * Used in contexts where both are needed together (e.g., dashboard rendering).
 */
export interface UserWithProfile extends User {
  readonly profile: UserProfile | null;
}
