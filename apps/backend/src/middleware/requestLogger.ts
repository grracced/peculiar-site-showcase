import pinoHttp from 'pino-http';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';
import { contextStorage } from './correlationId';

// pino-http handles automatic logging of incoming requests and outgoing responses
export const requestLogger = pinoHttp({
  logger,
  // Custom serializer to ensure we don't log massive payloads or sensitive headers
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
        // Only log headers we care about
        headers: {
          host: req.headers.host,
          userAgent: req.headers['user-agent'],
          xForwardedFor: req.headers['x-forwarded-for'],
        },
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
  // Customize log levels based on status codes
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});

// Middleware to assign a Correlation ID and wrap the request in an Async Context
export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const store = new Map<string, string>();
  
  // Extract existing header from frontend/gateway, or generate a new one
  const correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
  
  // Set the correlation ID in the context
  store.set('correlationId', correlationId);
  
  // Set it on the response header so the client can trace it
  res.setHeader('X-Correlation-ID', correlationId);

  // Run the rest of the request inside this async context
  contextStorage.run(store, () => {
    // Inject the ID into the request object so pino-http can attach it
    req.id = correlationId;
    next();
  });
};
