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
}
