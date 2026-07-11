import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/validation';
import { EmailAlreadyExistsError } from '../domain/user/services/registration.service';
import { InvalidCredentialsError, EmailNotVerifiedError, AccountSuspendedError, AccountLockedError } from '../domain/user/services/auth.service';
import { InvalidTokenError, ExpiredTokenError } from '../domain/user/services/email-verification.service';
import { PasswordReuseError } from '../domain/user/services/password-reset.service';
import { logger } from '../utils/logger';

/**
 * Global Express Error Handling Middleware.
 * Centralized Error-handling middleware for the Express backend.
 * Catches all errors forwarded by routes/controllers and formats standardized API responses.
 *
 * Security: Never exposes stack traces, internal paths, or implementation details
 * in error responses regardless of environment.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const correlationId = (req.headers['x-correlation-id'] as string) || 'system';

  // 0. Handle malformed JSON request bodies (SyntaxError from express.json())
  if (err instanceof SyntaxError && 'body' in err) {
    logger.warn({ correlationId }, 'Request failed: Malformed JSON body');
    res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Malformed JSON in request body',
      correlationId,
    });
    return;
  }

  // 1. Handle validation errors (Zod, custom validation helpers)
  if (err.name === 'ValidationError' && Array.isArray(err.details)) {
    logger.warn({ correlationId, details: err.details }, 'Request failed due to validation errors');
    res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      details: err.details,
      correlationId,
    });
    return;
  }

  // 1.5 Handle email registration conflicts
  if (err instanceof EmailAlreadyExistsError) {
    logger.warn({ correlationId, email: err.message }, 'Conflict occurred during registration');
    res.status(409).json({
      status: 409,
      error: 'Conflict',
      message: err.message,
      correlationId,
    });
    return;
  }

  // 2. Handle invalid credentials / logins
  if (err instanceof InvalidCredentialsError) {
    logger.warn({ correlationId }, 'Authentication failed: Invalid credentials');
    res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid email or password',
      correlationId,
    });
    return;
  }

  // 3. Handle unverified accounts
  if (err instanceof EmailNotVerifiedError) {
    logger.warn({ correlationId }, 'Authentication failed: Email not verified');
    res.status(403).json({
      status: 403,
      error: 'Forbidden',
      message: 'Email address has not been verified',
      correlationId,
    });
    return;
  }

  // 4. Handle suspended accounts
  if (err instanceof AccountSuspendedError) {
    logger.warn({ correlationId }, 'Authentication failed: Account suspended');
    res.status(403).json({
      status: 403,
      error: 'Forbidden',
      message: 'Account has been suspended',
      correlationId,
    });
    return;
  }

  // 4.1 Handle locked accounts
  if (err instanceof AccountLockedError) {
    logger.warn({ correlationId }, 'Authentication failed: Account temporarily locked');
    res.status(403).json({
      status: 403,
      error: 'Forbidden',
      message: 'Account is temporarily locked due to too many failed attempts',
      correlationId,
    });
    return;
  }

  // 5. Handle invalid or expired verification/reset tokens
  if (err instanceof InvalidTokenError) {
    logger.warn({ correlationId }, 'Token operation failed: Invalid token');
    res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Invalid token',
      correlationId,
    });
    return;
  }

  if (err instanceof ExpiredTokenError) {
    logger.warn({ correlationId }, 'Token operation failed: Expired token');
    res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Expired token',
      correlationId,
    });
    return;
  }

  // 5.1 Handle password reuse prevention errors
  if (err instanceof PasswordReuseError) {
    logger.warn({ correlationId }, 'Password update failed: Password reuse');
    res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Password has been used recently and cannot be reused',
      correlationId,
    });
    return;
  }

  // 5.2 Handle TypeError from malformed inputs
  if (err instanceof TypeError) {
    logger.warn({ correlationId, message: err.message }, 'Request failed: Type error');
    res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Invalid request data',
      correlationId,
    });
    return;
  }

  // 6. Generic/Unhandled Errors (500 Internal Server Error)
  // SECURITY: Stack traces are logged internally but NEVER sent to the client.
  logger.error(
    {
      correlationId,
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    },
    'An unhandled exception occurred in the application pipeline'
  );

  res.status(500).json({
    status: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred.',
    correlationId,
  });
};

