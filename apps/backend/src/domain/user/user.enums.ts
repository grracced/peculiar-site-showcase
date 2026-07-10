/**
 * User Domain Enumerations
 *
 * These enums represent the approved domain values from the Database Design.
 * They are the single source of truth for all user-related categorical fields
 * across the backend application.
 */

/**
 * The role assigned to a user account.
 * - USER: Standard application user with no elevated privileges.
 * - ADMIN: Platform administrator with access to management functions.
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

/**
 * The operational status of a user account.
 * - ACTIVE: The account is fully operational.
 * - SUSPENDED: The account has been temporarily restricted by an admin.
 * - PENDING_VERIFICATION: The user has registered but not yet verified their email.
 */
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

/**
 * The subscription tier of a user profile.
 * Stored on the UserProfile (not the User) to decouple billing data from auth data.
 * - FREE: The default tier. Subject to rate limits.
 * - PRO: Paid individual tier with higher limits.
 * - ENTERPRISE: Custom organizational tier.
 */
export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}
