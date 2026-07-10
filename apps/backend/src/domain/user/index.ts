/**
 * User Domain — Barrel Export
 *
 * Provides a single, clean import path for all user domain artifacts.
 * Consumers should import from '@/domain/user', not from individual files.
 *
 * @example
 * import { User, IUserRepository, CreateUserInput } from '@/domain/user';
 */

export * from './user.enums';
export * from './user.entity';
export * from './user.schema';
export * from './user.repository';
