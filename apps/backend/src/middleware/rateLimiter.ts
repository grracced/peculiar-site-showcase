import rateLimit from 'express-rate-limit';
import { SecurityAuditLogger, SecurityEvent } from '../utils/auditLogger';

const isTest = process.env.NODE_ENV === 'test';

/**
 * General rate limiter policy to protect API endpoints against DDoS/flooding.
 * Disabled under test suites to avoid test failures.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 10000 : Number(process.env.RATE_LIMIT_GENERAL_MAX || 100),
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    SecurityAuditLogger.log({
      event: SecurityEvent.RATE_LIMIT_EXCEEDED,
      ipAddress: req.ip || undefined,
      correlationId: req.headers['x-correlation-id'] as string,
      metadata: { limiter: 'general', path: req.path },
    });
    res.status(429).json(options.message);
  },
});

/**
 * Strong rate limiter policy targeting sensitive authentication endpoints
 * (login, registration).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10 : Number(process.env.RATE_LIMIT_AUTH_MAX || 10),
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many authentication attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    SecurityAuditLogger.log({
      event: SecurityEvent.RATE_LIMIT_EXCEEDED,
      ipAddress: req.ip || undefined,
      correlationId: req.headers['x-correlation-id'] as string,
      metadata: { limiter: 'auth', path: req.path },
    });
    res.status(429).json(options.message);
  },
});

/**
 * Strict rate limiter for password reset requests.
 * Prevents abuse of the password reset flow (email enumeration, spam).
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10 : Number(process.env.RATE_LIMIT_PASSWORD_RESET_MAX || 3),
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many password reset attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    SecurityAuditLogger.log({
      event: SecurityEvent.RATE_LIMIT_EXCEEDED,
      ipAddress: req.ip || undefined,
      correlationId: req.headers['x-correlation-id'] as string,
      metadata: { limiter: 'password-reset', path: req.path },
    });
    res.status(429).json(options.message);
  },
});

/**
 * Moderate rate limiter for email verification attempts.
 */
export const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10 : Number(process.env.RATE_LIMIT_VERIFY_EMAIL_MAX || 5),
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many verification attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    SecurityAuditLogger.log({
      event: SecurityEvent.RATE_LIMIT_EXCEEDED,
      ipAddress: req.ip || undefined,
      correlationId: req.headers['x-correlation-id'] as string,
      metadata: { limiter: 'verify-email', path: req.path },
    });
    res.status(429).json(options.message);
  },
});

/**
 * Moderate rate limiter for token refresh operations.
 */
export const refreshTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 100 : Number(process.env.RATE_LIMIT_REFRESH_MAX || 20),
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many token refresh attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    SecurityAuditLogger.log({
      event: SecurityEvent.RATE_LIMIT_EXCEEDED,
      ipAddress: req.ip || undefined,
      correlationId: req.headers['x-correlation-id'] as string,
      metadata: { limiter: 'refresh-token', path: req.path },
    });
    res.status(429).json(options.message);
  },
});
