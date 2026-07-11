# VerifAI Backend API

Node.js / Express backend for the VerifAI Document Verification SaaS platform on Hedera Hashgraph.

## Architecture Overview

```
src/
├── api/                    # HTTP Controllers & Route definitions
│   ├── auth/               # Authentication endpoints (login, logout, refresh, sessions)
│   ├── health/             # Health & readiness probes
│   └── users/              # User registration endpoints
├── config/                 # Environment validation & startup configuration
├── domain/                 # Domain entities, schemas, services (Clean Architecture)
│   └── user/               # User domain (entities, enums, schemas, services)
├── infrastructure/         # External concerns (repositories, email, database)
│   ├── database/           # Prisma client configuration
│   ├── email/              # Email service implementations
│   └── repositories/       # Data access implementations
├── middleware/              # Express middleware (security, logging, auth guards)
├── types/                  # TypeScript type extensions
└── utils/                  # Shared utilities (logger, password hashing, validation)
```

## Security Architecture

### Authentication Flow

```
1. Register  →  POST /api/v1/users          →  User + Profile created (PENDING_VERIFICATION)
2. Verify    →  GET  /api/v1/auth/verify-email?token=...  →  Email verified (ACTIVE)
3. Login     →  POST /api/v1/auth/login     →  Access Token (15m) + Refresh Token (7d)
4. Refresh   →  POST /api/v1/auth/refresh   →  New Access + Refresh (rotation)
5. Logout    →  POST /api/v1/auth/logout    →  Session revoked
```

### Security Layers

| Layer | Implementation |
|-------|---------------|
| **HTTP Headers** | Helmet (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) |
| **CORS** | Configurable origin whitelist with credentials support |
| **Rate Limiting** | Per-route rate limiters (login, registration, password reset, verification, refresh) |
| **Account Lockout** | Configurable failed attempts threshold with automatic timeout |
| **Password Security** | Argon2id hashing, strong policy (8+ chars, uppercase, lowercase, digit, special), reuse prevention |
| **JWT** | Access tokens (15m) + Refresh tokens (7d) with session-based rotation |
| **Input Sanitization** | HTML tag stripping, script injection prevention |
| **Request Tracing** | Correlation ID (X-Correlation-ID / X-Request-ID) via AsyncLocalStorage |
| **Error Handling** | Centralized handler, zero stack trace exposure, correlationId in responses |
| **Logging** | Structured JSON (Pino) with automatic sensitive field redaction |
| **Security Audit** | Typed security event logging (LOGIN_SUCCESS, LOGIN_FAILED, ACCOUNT_LOCKED, etc.) |
| **Parameter Pollution** | HPP middleware protection |
| **Body Size Limit** | 10KB maximum request payload |

### Rate Limiting Policies

| Endpoint | Max Requests | Window |
|----------|-------------|--------|
| General API | 100 | 15 min |
| Login / Registration | 10 | 15 min |
| Password Reset | 3 | 15 min |
| Email Verification | 5 | 15 min |
| Token Refresh | 20 | 15 min |

### Account Lockout

- **Threshold**: 5 failed login attempts (configurable via `LOCKOUT_MAX_ATTEMPTS`)
- **Duration**: 15 minutes (configurable via `LOCKOUT_DURATION_MINUTES`)
- **Reset**: Failed attempt counter resets on successful login
- **Auto-unlock**: Account unlocks automatically after timeout expires

## Environment Variables

### Required in Production

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Signing key for access tokens |
| `JWT_REFRESH_SECRET` | Signing key for refresh tokens |
| `DATABASE_URL` | PostgreSQL connection string |
| `APP_URL` | Public application URL |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed CORS origins |

### Optional (with defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Runtime environment |
| `PORT` | `3000` | Server listen port |
| `LOG_LEVEL` | `info` | Pino log level |
| `JWT_EXPIRES_IN` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |
| `JWT_REFRESH_EXPIRES_IN_HOURS` | `168` | Refresh session TTL (hours) |
| `RATE_LIMIT_GENERAL_MAX` | `100` | General rate limit |
| `RATE_LIMIT_AUTH_MAX` | `10` | Auth rate limit |
| `RATE_LIMIT_PASSWORD_RESET_MAX` | `3` | Password reset rate limit |
| `RATE_LIMIT_VERIFY_EMAIL_MAX` | `5` | Verification rate limit |
| `RATE_LIMIT_REFRESH_MAX` | `20` | Token refresh rate limit |
| `LOCKOUT_MAX_ATTEMPTS` | `5` | Failed login attempts before lockout |
| `LOCKOUT_DURATION_MINUTES` | `15` | Lockout duration |
| `VERIFICATION_TOKEN_EXPIRES_IN_HOURS` | `24` | Email verification token TTL |
| `PASSWORD_RESET_TOKEN_EXPIRES_IN_HOURS` | `1` | Password reset token TTL |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server (with hot reload)
pnpm run dev
```

### Running Tests

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch
```

### Docker

```bash
# Build the backend image (from monorepo root)
docker build -f apps/backend/Dockerfile -t verifai-backend .

# Run with Docker Compose
docker-compose up backend
```

## API Documentation

Swagger UI is available at `/api-docs` in non-production environments.

> **Note**: Swagger is automatically disabled when `NODE_ENV=production` to prevent API documentation exposure.

Protected endpoints require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

## Health Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /health/live` | Liveness probe — process is running |
| `GET /health/ready` | Readiness probe — application is ready to serve |
