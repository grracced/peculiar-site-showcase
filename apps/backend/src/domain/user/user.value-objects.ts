/**
 * User Domain — Value Objects
 *
 * Value Objects encapsulate validation and business rules around simple types
 * like email addresses or URLs. They make illegal states unrepresentable.
 *
 * A value object is immutable. Two value objects with the same value are equal.
 * They carry no identity — only their data matters.
 *
 * Source: Clean Architecture + Domain-Driven Design principles.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Email Value Object
// ---------------------------------------------------------------------------

const emailZodSchema = z
  .string()
  .email()
  .toLowerCase()
  .trim();

/**
 * Wraps a validated, normalized email address.
 *
 * Ensures that an `Email` can only be constructed if the value is a
 * syntactically valid email address. Normalizes to lowercase on creation.
 */
export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Creates a new Email instance after validating the input.
   * @throws {Error} If the provided string is not a valid email address.
   */
  static create(value: string): Email {
    const result = emailZodSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid email address: "${value}"`);
    }
    return new Email(result.data);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

// ---------------------------------------------------------------------------
// AvatarUrl Value Object
// ---------------------------------------------------------------------------

const avatarUrlZodSchema = z.string().url();

/**
 * Wraps a validated URL string for user avatar images.
 *
 * Ensures that an `AvatarUrl` can only be constructed from a syntactically
 * valid URL. Prevents storing malformed URLs in the database.
 */
export class AvatarUrl {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Creates a new AvatarUrl instance after validating the input.
   * @throws {Error} If the provided string is not a valid URL.
   */
  static create(value: string): AvatarUrl {
    const result = avatarUrlZodSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid avatar URL: "${value}"`);
    }
    return new AvatarUrl(result.data);
  }

  /**
   * Allows creating a nullable AvatarUrl, returning null for empty/null inputs.
   * Used when a user has not yet set an avatar.
   */
  static createNullable(value: string | null | undefined): AvatarUrl | null {
    if (!value) return null;
    return AvatarUrl.create(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: AvatarUrl): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
