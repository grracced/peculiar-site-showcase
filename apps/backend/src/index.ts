import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { correlationIdMiddleware, requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/sanitize';
import { usersRouter } from './api/users/users.router';
import { authRouter } from './api/auth/auth.router';
import { healthRouter } from './api/health/health.router';
import { generalLimiter } from './middleware/rateLimiter';

const app = express();

// Load OpenAPI specification
const openApiDocument = YAML.load(path.join(__dirname, '../../../docs/openapi.yaml'));

// 1. Core Security Defenses (Helmet, CORS, HPP, Body limits)
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
  })
);

const corsOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'https://getverifai.me'];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.use(hpp());
app.use(express.json({ limit: '10kb' })); // Limit request payloads to prevent memory flooding

// 1.5 Input Sanitization (strip HTML tags and script injections from request data)
app.use(sanitizeInput);

// 2. Extra HTTP Response Headers for Security compliance
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  next();
});

// 3. Correlation ID tracing and structured request logging
app.use(correlationIdMiddleware);
app.use(requestLogger);

// 4. Rate Limiting (General traffic — route-specific limiters are applied in routers)
app.use(generalLimiter);

// 5. Health & Liveness Checks (extracted to dedicated router)
app.use('/health', healthRouter);

// 6. Swagger API Documentation (Protected in production)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
}

// 7. API Routes (route-specific rate limiters are applied within each router)
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', authRouter);

// 8. Centralized Error Handler (must be registered last)
app.use(errorHandler);

export default app;
