import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { correlationIdMiddleware, requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { usersRouter } from './api/users/users.router';
import { authRouter } from './api/auth/auth.router';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3001;

// Load OpenAPI specification
const openApiDocument = YAML.load(path.join(__dirname, '../../../docs/openapi.yaml'));

// 1. Basic body parsers
app.use(express.json());

// 2. Correlation ID tracing and structured request logging
app.use(correlationIdMiddleware);
app.use(requestLogger);

// Serve Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// 3. API Routes
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', authRouter);

// 4. Centralized Error Handler (must be registered last)
app.use(errorHandler);

export default app; // exported for testing support
