import express from 'express';
import { correlationIdMiddleware, requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { usersRouter } from './api/users/users.router';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Basic body parsers
app.use(express.json());

// 2. Correlation ID tracing and structured request logging
app.use(correlationIdMiddleware);
app.use(requestLogger);

// 3. API Routes
app.use('/api/v1/users', usersRouter);

// 4. Centralized Error Handler (must be registered last)
app.use(errorHandler);

// 5. Bootstrap Server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

export default app; // exported for testing support
