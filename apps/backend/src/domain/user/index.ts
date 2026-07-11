/**
 * User Domain — Barrel Export
 *
 * Provides a single, clean import path for all user domain artifacts.
 * Consumers should import from '@/domain/user', not from individual files.
 *
 * @example
 * import { User, UserProfile, IUserRepository, IUserProfileRepository, Email } from '@/domain/user';
 */

export * from './user.enums';
export * from './user.entity';
export * from './user.schema';
export * from './user.repository';
export * from './user-profile.repository';
export * from './user.value-objects';
export * from './user-session.entity';
export * from './password-history.entity';
export * from './session.repository';
export * from './services/registration.service';
export * from './services/auth.service';
export * from './services/email.interface';
export * from './services/email-verification.service';
export * from './services/password-reset.service';
export * from './services/jwt.service';
export * from './services/session.service';
export * from './services/token.service';

