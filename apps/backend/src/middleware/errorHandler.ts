import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/validation';
import { EmailAlreadyExistsError } from '../domain/user/services/registration.service';
import { logger } from '../utils/logger';

/**
 * Global Express Error Handling Middleware.
 * Formats errors thrown in routers/controllers into standardized API JSON structures.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  // Retrieve the correlation ID (injected by correlationIdMiddleware) to log alongside the error
  const correlationId = req.id;

  // 1. Handle Zod validation errors
  if (err instanceof ValidationError) {
    logger.warn(
      { correlationId, details: err.response.details },
      'Request failed due to validation errors'
    );
    return res.status(400).json(err.response);
  }

  // 2. Handle business constraint errors (duplicate email)
  if (err instanceof EmailAlreadyExistsError) {
    logger.warn({ correlationId, email: err.message }, 'Conflict occurred during registration');
    return res.status(409).json({
      status: 409,
      error: 'Conflict',
      message: err.message,
    });
  }

  // 3. Fallback for unhandled internal exceptions
  logger.error(
    { correlationId, err: { message: err.message, stack: err.stack } },
    'Unhandled server error occurred'
  );

  return res.status(500).json({
    status: 500,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
  });
}
