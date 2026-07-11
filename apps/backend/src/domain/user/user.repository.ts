/**
 * User Repository Interface
 *
 * This interface defines the contract that any data-access implementation
 * for the User domain MUST satisfy. It follows the Repository pattern from
 * Clean Architecture: the domain layer owns the interface; the infrastructure
 * layer (Prisma) provides the concrete implementation.
 *
 * Principle: Depend on abstractions, not concretions.
 *
 * IMPORTANT: This file contains NO implementation. It is only a contract.
 * The Prisma implementation will be created in a later sprint (Database Layer).
 */

import { User, UserProfile, UserWithProfile } from './user.entity';
import { CreateUserInput, UpdateUserProfileInput, AdminUpdateUserInput } from './user.schema';

export interface IUserRepository {
  /**
   * Finds a single active (non-deleted) user by their primary key.
   * @param id - The user's UUID.
   * @returns The User entity, or null if not found or soft-deleted.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Finds a single active user by their email address.
   * Used during the authentication flow to retrieve the user record.
   * @param email - The user's email address (case-insensitive).
   * @returns The User entity, or null if not found.
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Retrieves the hashed password for a user by their email address.
   * This is separate from findByEmail to prevent leaking the password hash
   * in public User domain entities.
   * @param email - The user's email address (case-insensitive).
   * @returns The hashed password string, or null if user not found.
   */
  getPasswordHashByEmail(email: string): Promise<string | null>;

  /**
   * Finds a user along with their associated profile in a single query.
   * @param id - The user's UUID.
   * @returns The UserWithProfile composite, or null if not found.
   */
  findWithProfile(id: string): Promise<UserWithProfile | null>;

  /**
   * Creates a new user account record.
   * The password is handled by Supabase Auth externally; this creates the
   * application-level record that references the auth user.
   * @param data - Validated user creation data.
   * @returns The newly created User entity.
   */
  create(data: CreateUserInput): Promise<User>;

  /**
   * Transactionally creates both the User and UserProfile records.
   * This implements the transactional requirement for the registration flow.
   * 
   * @param data - The user registration data, including names and hashed password.
   * @returns The created User and associated UserProfile composite.
   */
  createWithProfile(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): Promise<UserWithProfile>;

  /**
   * Updates a user's application profile (name, avatar, etc.).
   * @param userId - The UUID of the user whose profile is being updated.
   * @param data - Validated partial profile update data.
   * @returns The updated UserProfile entity.
   */
  updateProfile(userId: string, data: UpdateUserProfileInput): Promise<UserProfile>;

  /**
   * Allows an administrator to update a user's role or account status.
   * @param userId - The target user's UUID.
   * @param data - Validated admin update data.
   * @returns The updated User entity.
   */
  adminUpdate(userId: string, data: AdminUpdateUserInput): Promise<User>;

  /**
   * Performs a soft-delete on a user account.
   * Sets `deleted_at` to the current timestamp. The row is NEVER physically removed.
   * @param id - The UUID of the user to soft-delete.
   * @returns void.
   */
  softDelete(id: string): Promise<void>;

  /**
   * Stores the verification token hash and expiration details.
   *
   * @param userId - The user ID to store the verification details against.
   * @param tokenHash - Hashed verification token, or null to clear.
   * @param expiresAt - Expiration timestamp, or null to clear.
   */
  updateVerificationToken(userId: string, tokenHash: string | null, expiresAt: Date | null): Promise<void>;

  /**
   * Finds an active user by their hashed verification token.
   *
   * @param tokenHash - The hashed token.
   * @returns The User, or null if not found or token has expired/unmatched.
   */
  findByVerificationTokenHash(tokenHash: string): Promise<User | null>;

  /**
   * Marks a user's email as verified. Clears the verification token hash,
   * expiration window, sets emailVerified = true and sets emailVerifiedAt timestamp.
   *
   * @param userId - The user ID to verify.
   * @param verifiedAt - Timestamp of successful verification.
   * @returns The updated User entity.
   */
  verifyEmail(userId: string, verifiedAt: Date): Promise<User>;

  /**
   * Retrieves the expiration date of the verification token for a given user.
   *
   * @param userId - The user ID.
   * @returns Expiration timestamp, or null if not set or user not found.
   */
  getVerificationExpiry(userId: string): Promise<Date | null>;

  /**
   * Stores the password reset token hash and expiration details.
   *
   * @param userId - The user ID.
   * @param tokenHash - Hashed password reset token, or null to clear.
   * @param expiresAt - Expiration timestamp, or null to clear.
   */
  updatePasswordResetToken(userId: string, tokenHash: string | null, expiresAt: Date | null): Promise<void>;

  /**
   * Finds an active user by their hashed password reset token.
   *
   * @param tokenHash - The hashed token.
   * @returns The User, or null if not found.
   */
  findByPasswordResetTokenHash(tokenHash: string): Promise<User | null>;

  /**
   * Resets the user's password. Updates `passwordHash` and `passwordChangedAt` timestamp,
   * while clearing the password reset token hash and expiration details.
   *
   * @param userId - The user ID.
   * @param passwordHash - Newly hashed password.
   * @param changedAt - Timestamp of successful change.
   * @returns The updated User entity.
   */
  resetPassword(userId: string, passwordHash: string, changedAt: Date): Promise<User>;

  /**
   * Retrieves the expiration date of the password reset token for a given user.
   *
   * @param userId - The user ID.
   * @returns Expiration timestamp, or null if not set or user not found.
   */
  getPasswordResetExpiry(userId: string): Promise<Date | null>;

  /**
   * Increments the user's failed login attempt counter.
   */
  incrementFailedAttempts(userId: string): Promise<User>;

  /**
   * Locks the user's account until a specific expiration date.
   */
  lockAccount(userId: string, lockoutUntil: Date): Promise<User>;

  /**
   * Resets the user's failed login attempt counter and clears lockout details.
   */
  resetFailedAttempts(userId: string): Promise<User>;

  /**
   * Retrieves previous password hashes of a user for reuse prevention.
   */
  getPasswordHistory(userId: string): Promise<string[]>;

  /**
   * Adds a new entry to the user's password change history.
   */
  addPasswordHistoryEntry(userId: string, passwordHash: string): Promise<void>;
}
