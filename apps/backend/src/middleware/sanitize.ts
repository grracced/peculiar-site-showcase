import { Request, Response, NextFunction } from 'express';

/**
 * Recursively strips HTML tags and script injection patterns from string values
 * in request bodies, query parameters, and URL parameters.
 *
 * This is a lightweight, zero-dependency sanitization middleware suitable for
 * API-only backends that never render HTML. For applications serving HTML,
 * a more robust solution like DOMPurify would be needed.
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query) as typeof req.query;
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params) as typeof req.params;
  }

  next();
};

/**
 * Recursively sanitizes all string values in an object by stripping
 * HTML tags and common script injection patterns.
 */
function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized as T;
  }

  return obj;
}

/**
 * Strips HTML tags and dangerous patterns from a string value.
 * Preserves the textual content while removing markup.
 */
function sanitizeString(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')          // Strip HTML tags
    .replace(/javascript:/gi, '')      // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '')        // Remove inline event handlers (onclick=, etc.)
    .replace(/data:\s*text\/html/gi, ''); // Remove data:text/html payloads
}
