import pino from 'pino';
import { getCorrelationId } from '../middleware/correlationId';

const isProduction = process.env.NODE_ENV === 'production';

// Pino is the fastest JSON logger in Node.js
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Format differently based on environment
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  // Automatically inject the correlation ID if it exists in the current async context
  mixin() {
    const correlationId = getCorrelationId();
    return correlationId ? { correlationId } : {};
  },
  // Redaction prevents sensitive keys from ever reaching log outputs
  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      'apiKey',
      'secret',
      'privateKey',
      'headers.authorization',
      'req.headers.authorization',
      '*.password',
    ],
    censor: '[REDACTED]',
  },
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

/**
 * LOG LEVELS USAGE:
 * - fatal: System crashes, unrecoverable errors causing downtime.
 * - error: Request failures, caught exceptions, DB connection drops.
 * - warn: Deprecated API usage, rate limit approaches, suspicious activity.
 * - info: Normal application events (Server started, AI job completed).
 * - debug: Detailed flow tracking (DB query executed, payload parsed).
 * - trace: Extremely granular function-level entry/exit for deep debugging.
 */
