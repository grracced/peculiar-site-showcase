/**
 * Reusable Validation Utilities
 *
 * Provides a standardized way to parse Zod schemas and format their complex,
 * nested error structures into a flat, developer-friendly JSON response.
 */

import { ZodError, ZodSchema } from 'zod';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface StandardizedValidationError {
  status: 400;
  error: 'Validation Error';
  details: ValidationErrorDetail[];
}

/**
 * Converts a nested ZodError into a flat array of field/message objects.
 * Useful for returning clear error messages to frontend clients.
 *
 * @param error - The ZodError thrown during schema parsing.
 * @returns A standardized validation error response.
 */
export function formatZodError(error: ZodError): StandardizedValidationError {
  const details = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return {
    status: 400,
    error: 'Validation Error',
    details,
  };
}

/**
 * A custom error class to be thrown when validation fails.
 * Designed to be caught by global Express error handlers.
 */
export class ValidationError extends Error {
  public readonly response: StandardizedValidationError;

  constructor(zodError: ZodError) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.response = formatZodError(zodError);
  }
}

/**
 * Safely parses data against a Zod schema.
 * Throws a standardized `ValidationError` if parsing fails.
 *
 * @param schema - The Zod schema to validate against.
 * @param data - The unknown data (usually a request body).
 * @returns The strongly-typed, parsed data.
 * @throws {ValidationError}
 */
export function validateData<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(result.error);
  }

  return result.data;
}
