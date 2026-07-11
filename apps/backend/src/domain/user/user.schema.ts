/**
 * User Domain Validation Schemas
 *
 * Uses Zod for runtime validation of incoming data. These schemas enforce
 * domain constraints at the application boundary before any data reaches
 * the repository or database layer.
 *
 * Principle: Validate at the edge; trust within the domain.
 */

import { z } from 'zod';
import { UserRole, AccountStatus, SubscriptionTier } from './user.enums';

// ---------------------------------------------------------------------------
// Primitive Schemas (reusable building blocks)
// ---------------------------------------------------------------------------

const uuidSchema = z.string().uuid({ message: 'Invalid UUID format.' });

const emailSchema = z
  .string()
  .email({ message: 'A valid email address is required.' })
  .toLowerCase()
  .trim();

/**
 * Password complexity rules:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * Password is only validated at registration/change; it is NEVER stored or logged.
 */
const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters.' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
  .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character.' });

const fullNameSchema = z
  .string()
  .min(2, { message: 'Full name must be at least 2 characters.' })
  .max(100, { message: 'Full name cannot exceed 100 characters.' })
  .trim()
  .nullable();

// ---------------------------------------------------------------------------
// Enum Schemas (validate that a value belongs to an approved domain enum)
// ---------------------------------------------------------------------------

export const userRoleSchema = z.nativeEnum(UserRole);
export const accountStatusSchema = z.nativeEnum(AccountStatus);
export const subscriptionTierSchema = z.nativeEnum(SubscriptionTier);

// ---------------------------------------------------------------------------
// Composite Schemas (for specific use-case actions)
// ---------------------------------------------------------------------------

/**
 * Schema for creating a new user account (Internal Repository Input).
 * Used when mapping DTOs to the actual domain inputs.
 */
export const CreateUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Schema for external registration requests (DTO).
 * Enforces first/last name presence and strict password matching.
 */
export const UserRegistrationSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }).max(50).trim(),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }).max(50).trim(),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword']
});

/**
 * Schema for updating a user's own profile.
 * All fields are optional so partial updates are supported.
 */
export const UpdateUserProfileSchema = z.object({
  fullName: fullNameSchema.optional(),
  avatarUrl: z.string().url({ message: 'Avatar URL must be a valid URL.' }).nullable().optional(),
});

/**
 * Schema for an admin updating a user's account status or role.
 */
export const AdminUpdateUserSchema = z.object({
  role: userRoleSchema.optional(),
  status: accountStatusSchema.optional(),
});

// ---------------------------------------------------------------------------
// Inferred Types (derive TypeScript types directly from schemas to stay DRY)
// ---------------------------------------------------------------------------

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
export type AdminUpdateUserInput = z.infer<typeof AdminUpdateUserSchema>;

/**
 * Schema for external login requests (DTO).
 * Enforces email normalization and presence of required credentials.
 */
export const LoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required.' }),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Schema defining the validation contract for authentication responses.
 * Restricts data to non-sensitive fields.
 */
export const AuthResponseSchema = z.object({
  userId: z.string().uuid(),
  email: emailSchema,
  fullName: z.string().min(1).max(100),
  role: userRoleSchema,
  emailVerified: z.boolean(),
});

export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;

export const ForgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

