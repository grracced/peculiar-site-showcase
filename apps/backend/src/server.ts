import dotenv from 'dotenv';
dotenv.config();

import { validateEnvironment } from './config/env';
validateEnvironment();

import app from './index';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3000;

// Bootstrap Server (called only when starting the server process)
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
