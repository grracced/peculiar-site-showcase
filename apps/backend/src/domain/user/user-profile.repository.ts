/**
 * User Profile Repository Interface
 *
 * Follows the Single Responsibility Principle: this interface is concerned
 * ONLY with UserProfile data access operations.
 *
 * The separation from IUserRepository reflects the 1:1 database relationship:
 * - IUserRepository → `users` table
 * - IUserProfileRepository → `user_profiles` table
 *
 * This allows the infrastructure layer to implement each repository independently
 * and makes each easier to mock in unit tests.
 *
 * IMPORTANT: This file contains NO implementation. It is only a contract.
 */

import { UserProfile } from './user.entity';
import { UpdateUserProfileInput } from './user.schema';

export interface IUserProfileRepository {
  /**
   * Finds the profile associated with a given user ID.
   * @param userId - The parent user's UUID (Foreign Key).
   * @returns The UserProfile entity, or null if none exists yet.
   */
  findByUserId(userId: string): Promise<UserProfile | null>;

  /**
   * Creates a default (empty) profile row immediately after a user registers.
   * Called by the registration service to establish the 1:1 relationship.
   * @param userId - The UUID of the newly registered user.
   * @returns The newly created UserProfile entity (with FREE tier defaults).
   */
  createForUser(userId: string): Promise<UserProfile>;

  /**
   * Updates an existing profile for a given user.
   * Supports partial updates: only fields present in `data` are modified.
   * @param userId - The UUID of the user whose profile is being updated.
   * @param data - Validated partial profile data.
   * @returns The updated UserProfile entity.
   */
  update(userId: string, data: UpdateUserProfileInput): Promise<UserProfile>;

  /**
   * Checks whether a profile row exists for a given user.
   * Used to guard against creating duplicate profiles.
   * @param userId - The user's UUID.
   * @returns True if the profile exists, false otherwise.
   */
  existsForUser(userId: string): Promise<boolean>;
}
