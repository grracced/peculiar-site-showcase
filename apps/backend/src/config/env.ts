import { logger } from '../utils/logger';

/**
 * Defines a single environment variable requirement.
 */
interface EnvVariable {
  /** The environment variable name. */
  name: string;
  /** Whether the variable is required in production. If missing, the app will crash. */
  requiredInProduction: boolean;
  /** Description used in startup log output. */
  description: string;
}

/**
 * Validates that all required environment variables are configured.
 * Crashes the application process if critical configurations are missing in production.
 */
export function validateEnvironment(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const requiredSecrets: EnvVariable[] = [
    { name: 'JWT_SECRET', requiredInProduction: true, description: 'Access token signing key' },
    { name: 'JWT_REFRESH_SECRET', requiredInProduction: true, description: 'Refresh token signing key' },
    { name: 'DATABASE_URL', requiredInProduction: true, description: 'PostgreSQL connection string' },
    { name: 'APP_URL', requiredInProduction: true, description: 'Public application URL' },
    { name: 'CORS_ALLOWED_ORIGINS', requiredInProduction: true, description: 'Comma-separated allowed CORS origins' },
  ];

  const optionalVariables: EnvVariable[] = [
    { name: 'PORT', requiredInProduction: false, description: 'Server listen port' },
    { name: 'LOG_LEVEL', requiredInProduction: false, description: 'Pino log level' },
    { name: 'RATE_LIMIT_GENERAL_MAX', requiredInProduction: false, description: 'General rate limit max requests' },
    { name: 'RATE_LIMIT_AUTH_MAX', requiredInProduction: false, description: 'Auth rate limit max requests' },
    { name: 'RATE_LIMIT_PASSWORD_RESET_MAX', requiredInProduction: false, description: 'Password reset rate limit' },
    { name: 'RATE_LIMIT_VERIFY_EMAIL_MAX', requiredInProduction: false, description: 'Email verification rate limit' },
    { name: 'RATE_LIMIT_REFRESH_MAX', requiredInProduction: false, description: 'Token refresh rate limit' },
    { name: 'LOCKOUT_MAX_ATTEMPTS', requiredInProduction: false, description: 'Failed login attempts before lockout' },
    { name: 'LOCKOUT_DURATION_MINUTES', requiredInProduction: false, description: 'Account lockout duration' },
    { name: 'JWT_EXPIRES_IN', requiredInProduction: false, description: 'Access token TTL' },
    { name: 'JWT_REFRESH_EXPIRES_IN', requiredInProduction: false, description: 'Refresh token TTL' },
    { name: 'JWT_REFRESH_EXPIRES_IN_HOURS', requiredInProduction: false, description: 'Refresh session TTL (hours)' },
    { name: 'VERIFICATION_TOKEN_EXPIRES_IN_HOURS', requiredInProduction: false, description: 'Email verification token TTL' },
    { name: 'PASSWORD_RESET_TOKEN_EXPIRES_IN_HOURS', requiredInProduction: false, description: 'Password reset token TTL' },
  ];

  const missing: string[] = [];

  for (const variable of requiredSecrets) {
    if (!process.env[variable.name]) {
      if (isProduction && variable.requiredInProduction) {
        missing.push(variable.name);
      } else {
        logger.warn(
          `Environment variable ${variable.name} is missing. Falling back to default for development/testing.`
        );
      }
    }
  }

  if (missing.length > 0) {
    logger.fatal(
      { missing },
      'CRITICAL STARTUP ERROR: Missing required secrets. Application terminating immediately.'
    );
    process.exit(1);
  }

  // Log warnings for optional variables that are unset
  for (const variable of optionalVariables) {
    if (!process.env[variable.name]) {
      logger.debug(`Optional variable ${variable.name} (${variable.description}) not set. Using default.`);
    }
  }

  logger.info(
    { environment: process.env.NODE_ENV || 'development' },
    'Environment variables validation check passed.'
  );
}

