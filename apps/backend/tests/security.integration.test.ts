import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { InMemoryUserRepository } from '../src/infrastructure/repositories/in-memory-user.repository';
import { InMemorySessionRepository } from '../src/infrastructure/repositories/in-memory-session.repository';
import { hashPassword } from '../src/utils/password';
import { AccountStatus } from '../src/domain/user/user.enums';
import { JwtService } from '../src/domain/user/services/jwt.service';

describe('Security Hardening Integration Tests', () => {
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    userRepository.clear();
  });

  // =========================================================================
  // CORS Policy
  // =========================================================================
  describe('CORS Policy', () => {
    it('should allow requests from configured allowed origins', async () => {
      // Configuration fallback defaults to http://localhost:3000
      const response = await request(app)
        .get('/health/live')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should reject requests from unauthorized origins', async () => {
      const response = await request(app)
        .get('/health/live')
        .set('Origin', 'http://malicious-domain.com');

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should support credentials for allowed origins', async () => {
      const response = await request(app)
        .options('/api/v1/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  // =========================================================================
  // HTTP Security Headers
  // =========================================================================
  describe('HTTP Security Headers', () => {
    it('should return required security headers in responses', async () => {
      const response = await request(app).get('/health/live');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['referrer-policy']).toBe('no-referrer');
      expect(response.headers['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
    });

    it('should disable x-powered-by header', async () => {
      const response = await request(app).get('/health/live');
      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('should include correlation ID and request ID headers', async () => {
      const response = await request(app).get('/health/live');
      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-request-id']).toBeDefined();
      // Both should be the same value
      expect(response.headers['x-correlation-id']).toBe(response.headers['x-request-id']);
    });

    it('should include Helmet CSP headers', async () => {
      const response = await request(app).get('/health/live');
      expect(response.headers['content-security-policy']).toBeDefined();
    });
  });

  // =========================================================================
  // Rate Limiting
  // =========================================================================
  describe('Rate Limiting', () => {
    it('should trigger auth rate limiting after 10 request attempts', async () => {
      // Under test, auth rate limiter maximum is configured to 10 attempts
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@example.com', password: 'AnyPassword1!' });
      }

      // 11th request should be blocked with 429
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'AnyPassword1!' });

      expect(response.status).toBe(429);
      expect(response.body.error).toBe('Too Many Requests');
    });

    it('should return standard rate limit headers', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'AnyPassword1!' });

      // RateLimit-* headers should be present (standard headers enabled)
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
    });
  });

  // =========================================================================
  // Account Lockout
  // =========================================================================
  describe('Account Lockout', () => {
    it('should lock user account after 5 failed login attempts and unlock after timeout', async () => {
      const email = 'lockout.target@example.com';
      const password = 'CorrectPassword1!';
      const passwordHash = await hashPassword(password);

      const user = await userRepository.createWithProfile({
        email,
        passwordHash,
        firstName: 'Lockout',
        lastName: 'Target',
      });
      await userRepository.adminUpdate(user.id, { status: AccountStatus.ACTIVE });
      const internalUser = (userRepository as any).users.get(user.id);
      internalUser.emailVerified = true;

      // 5 Failed login attempts
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({ email, password: 'WrongPassword1!' });
        expect(res.status).toBe(401);
      }

      // 6th login attempt (with correct credentials) should fail with 403 Forbidden because of lockout
      const lockedResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      expect(lockedResponse.status).toBe(403);
      expect(lockedResponse.body.message).toContain('temporarily locked');

      // Simulate lock expiry by shifting lockoutUntil in the repository
      const rawUser = (userRepository as any).users.get(user.id);
      rawUser.lockoutUntil = new Date(Date.now() - 1000); // 1 second ago

      // Login now with correct credentials should succeed
      const successResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      expect(successResponse.status).toBe(200);
      expect(successResponse.body.data.accessToken).toBeDefined();
    });

    it('should reset failed attempts after successful login', async () => {
      const email = 'reset.attempts@example.com';
      const password = 'CorrectPassword1!';
      const passwordHash = await hashPassword(password);

      const user = await userRepository.createWithProfile({
        email,
        passwordHash,
        firstName: 'Reset',
        lastName: 'Attempts',
      });
      await userRepository.adminUpdate(user.id, { status: AccountStatus.ACTIVE });
      const internalUser = (userRepository as any).users.get(user.id);
      internalUser.emailVerified = true;

      // 3 Failed login attempts (below lockout threshold)
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({ email, password: 'WrongPassword1!' });
      }

      // Successful login should reset the counter
      const successResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      expect(successResponse.status).toBe(200);

      // Verify counter was reset - user should be able to attempt 5 more times
      const rawUser = (userRepository as any).users.get(user.id);
      expect(rawUser.failedLoginAttempts).toBe(0);
      expect(rawUser.lockoutUntil).toBeNull();
    });
  });

  // =========================================================================
  // Invalid JWT
  // =========================================================================
  describe('Invalid JWT', () => {
    it('should reject requests with missing Authorization header', async () => {
      const response = await request(app).get('/api/v1/auth/sessions');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject requests with malformed Bearer token format', async () => {
      const response = await request(app)
        .get('/api/v1/auth/sessions')
        .set('Authorization', 'NotBearer some-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject requests with expired access token', async () => {
      // Create a JWT that is already expired
      const jwtService = new JwtService();
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: 'test-id', email: 'test@example.com', role: 'USER' },
        process.env.JWT_SECRET || 'dev_jwt_access_secret_key_123!',
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .get('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject requests with tampered access token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/sessions')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.payload');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });

  // =========================================================================
  // Invalid Refresh Token
  // =========================================================================
  describe('Invalid Refresh Token', () => {
    it('should reject refresh with missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Refresh token is required.');
    });

    it('should reject refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token-string' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  // =========================================================================
  // Validation Failures
  // =========================================================================
  describe('Validation Failures', () => {
    it('should reject login with missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'Password123!' });

      expect(response.status).toBe(400);
    });

    it('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'weak',
          confirmPassword: 'weak',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with mismatched passwords', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword123!',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'not-an-email',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(response.status).toBe(400);
    });
  });

  // =========================================================================
  // Password Reuse Prevention
  // =========================================================================
  describe('Password Reuse Prevention', () => {
    it('should block users from reusing any password in their history', async () => {
      const email = 'history.target@example.com';
      const originalPassword = 'OriginalPassword1!';
      const passwordHash = await hashPassword(originalPassword);

      const user = await userRepository.createWithProfile({
        email,
        passwordHash,
        firstName: 'History',
        lastName: 'Target',
      });
      await userRepository.adminUpdate(user.id, { status: AccountStatus.ACTIVE });
      const internalUser = (userRepository as any).users.get(user.id);
      internalUser.emailVerified = true;

      // Add original password to history
      await userRepository.addPasswordHistoryEntry(user.id, passwordHash);

      // Test password reuse via service layer
      const { PasswordResetService } = await import('../src/domain/user/services/password-reset.service');
      const { MockEmailService } = await import('../src/infrastructure/email/mock-email.service');

      const sessionRepo = new InMemorySessionRepository();
      const emailService = new MockEmailService();
      const passwordResetService = new PasswordResetService(userRepository, emailService, sessionRepo);

      // Request reset to generate token
      await passwordResetService.requestPasswordReset(email);
      const updatedUser = (userRepository as any).users.get(user.id);

      // Set a known token hash for testing
      const plaintextToken = 'dummy_token_123';
      const dummyHash = (passwordResetService as any).hashToken(plaintextToken);
      updatedUser.passwordResetTokenHash = dummyHash;
      updatedUser.passwordResetExpiresAt = new Date(Date.now() + 3600 * 1000);

      // Resetting to original password should throw reuse error
      await expect(
        passwordResetService.resetPassword(plaintextToken, originalPassword)
      ).rejects.toThrow('Password has been used recently');
    });
  });

  // =========================================================================
  // Health Endpoints
  // =========================================================================
  describe('Health Endpoints', () => {
    it('/health/live should return 200 UP with minimal information', async () => {
      const response = await request(app).get('/health/live');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('UP');
      // Liveness should NOT expose timestamps or internal details
      expect(response.body.timestamp).toBeUndefined();
    });

    it('/health/ready should return 200 UP', async () => {
      const response = await request(app).get('/health/ready');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('UP');
    });

    it('health endpoints should not expose sensitive information', async () => {
      const liveResponse = await request(app).get('/health/live');
      const readyResponse = await request(app).get('/health/ready');

      // Ensure no database URLs, secrets, or version info is exposed
      const liveBody = JSON.stringify(liveResponse.body);
      const readyBody = JSON.stringify(readyResponse.body);

      expect(liveBody).not.toContain('postgresql');
      expect(liveBody).not.toContain('secret');
      expect(readyBody).not.toContain('postgresql');
      expect(readyBody).not.toContain('secret');
    });
  });

  // =========================================================================
  // Request Body Size Limit
  // =========================================================================
  describe('Request Body Size Limit', () => {
    it('should reject oversized request bodies', async () => {
      // Generate a payload larger than 10KB
      const oversizedPayload = {
        email: 'test@example.com',
        password: 'Password123!',
        data: 'x'.repeat(15000), // ~15KB
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(oversizedPayload);

      expect(response.status).toBe(413);
    });
  });

  // =========================================================================
  // Input Sanitization
  // =========================================================================
  describe('Input Sanitization', () => {
    it('should strip HTML tags from request body inputs', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: '<script>alert("xss")</script>test@example.com',
          password: 'Password123!',
        });

      // The request should still be processed (sanitized input goes through validation)
      // The email will fail validation because the tags are stripped, leaving invalid format
      expect(response.status).toBe(401); // Invalid credentials after sanitization
    });
  });

  // =========================================================================
  // Swagger Protection
  // =========================================================================
  describe('Swagger Protection', () => {
    it('should serve Swagger docs in non-production mode', async () => {
      // Tests run with NODE_ENV=test, which is not production
      const response = await request(app).get('/api-docs/');
      // Should return HTML page or redirect, not 404
      expect(response.status).not.toBe(404);
    });
  });

  // =========================================================================
  // Error Response Format
  // =========================================================================
  describe('Error Response Format', () => {
    it('should include correlationId in error responses', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'Password123!' });

      expect(response.status).toBe(401);
      expect(response.body.correlationId).toBeDefined();
    });

    it('should never expose stack traces in error responses', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'Password123!' });

      expect(response.body.stack).toBeUndefined();
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Malformed JSON');
    });
  });
});
