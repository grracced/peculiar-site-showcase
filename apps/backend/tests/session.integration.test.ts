import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { InMemoryUserRepository } from '../src/infrastructure/repositories/in-memory-user.repository';
import { InMemorySessionRepository } from '../src/infrastructure/repositories/in-memory-session.repository';
import { hashPassword } from '../src/utils/password';
import { UserRole, AccountStatus } from '../src/domain/user/user.enums';
import { JwtService } from '../src/domain/user/services/jwt.service';

describe('Session & JWT Integration Tests', () => {
  let userRepository: InMemoryUserRepository;
  let sessionRepository: InMemorySessionRepository;
  let jwtService: JwtService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    userRepository.clear();
    sessionRepository = new InMemorySessionRepository();
    sessionRepository.clear();
    jwtService = new JwtService();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return access token and refresh token on successful credentials check', async () => {
      const email = 'john.doe@example.com';
      const password = 'Password123!';
      const passwordHash = await hashPassword(password);

      const user = await userRepository.createWithProfile({
        email,
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
      });
      // Activate
      await userRepository.adminUpdate(user.id, {
        status: AccountStatus.ACTIVE,
      });
      const internalUser = (userRepository as any).users.get(user.id);
      internalUser.emailVerified = true;

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      expect(response.status).toBe(200);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.expiresIn).toBeDefined();
      expect(response.body.data.tokenType).toBe('Bearer');
      expect(response.body.data.user.email).toBe(email);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should successfully rotate tokens', async () => {
      const email = 'john.doe@example.com';
      const password = 'Password123!';
      const passwordHash = await hashPassword(password);

      const user = await userRepository.createWithProfile({
        email,
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
      });
      await userRepository.adminUpdate(user.id, {
        status: AccountStatus.ACTIVE,
      });
      const internalUser = (userRepository as any).users.get(user.id);
      internalUser.emailVerified = true;

      // 1. Get initial tokens
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      const oldRefreshToken = loginResponse.body.data.refreshToken;
      expect(oldRefreshToken).toBeDefined();

      // 2. Perform refresh
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: oldRefreshToken });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.data.accessToken).toBeDefined();
      expect(refreshResponse.body.data.refreshToken).toBeDefined();
      
      // Verify previous token is invalidated
      const retryResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: oldRefreshToken });

      expect(retryResponse.status).toBe(400); // reuse block
    });

    it('should fail with 400 Bad Request for an invalid/missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid_token' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should invalidate the refresh token session', async () => {
      const email = 'john.doe@example.com';
      const password = 'Password123!';
      const passwordHash = await hashPassword(password);

      const user = await userRepository.createWithProfile({
        email,
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
      });
      await userRepository.adminUpdate(user.id, {
        status: AccountStatus.ACTIVE,
      });
      const internalUser = (userRepository as any).users.get(user.id);
      internalUser.emailVerified = true;

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      const refreshToken = loginResponse.body.data.refreshToken;

      const logoutResponse = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken });

      expect(logoutResponse.status).toBe(200);

      // Verify token cannot be used again
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(refreshResponse.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/sessions', () => {
    it('should list all active sessions with current indicator', async () => {
      const email = 'john.doe@example.com';
      const password = 'Password123!';
      const passwordHash = await hashPassword(password);

      const user = await userRepository.createWithProfile({
        email,
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
      });
      await userRepository.adminUpdate(user.id, {
        status: AccountStatus.ACTIVE,
      });
      const internalUser = (userRepository as any).users.get(user.id);
      internalUser.emailVerified = true;

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      const accessToken = loginResponse.body.data.accessToken;

      const sessionsResponse = await request(app)
        .get('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(sessionsResponse.status).toBe(200);
      expect(sessionsResponse.body.data).toHaveLength(1);
      expect(sessionsResponse.body.data[0].isCurrent).toBe(true);
    });

    it('should deny access without a valid Bearer token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/sessions');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/auth/sessions/:id', () => {
    it('should successfully revoke session by ID', async () => {
      const email = 'john.doe@example.com';
      const password = 'Password123!';
      const passwordHash = await hashPassword(password);

      const user = await userRepository.createWithProfile({
        email,
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
      });
      await userRepository.adminUpdate(user.id, {
        status: AccountStatus.ACTIVE,
      });
      const internalUser = (userRepository as any).users.get(user.id);
      internalUser.emailVerified = true;

      const loginResponse1 = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      const accessToken = loginResponse1.body.data.accessToken;

      // Create a second session (simulating second device)
      const loginResponse2 = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      const secondSessionId = (sessionRepository as any).sessions.get(
        Array.from((sessionRepository as any).sessions.keys())[1]
      ).id;

      // Revoke second session
      const revokeResponse = await request(app)
        .delete(`/api/v1/auth/sessions/${secondSessionId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(revokeResponse.status).toBe(200);

      // Verify second token cannot refresh
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: loginResponse2.body.data.refreshToken });

      expect(refreshResponse.status).toBe(400);
    });

    it('should prevent users from revoking another user session', async () => {
      const passwordHash = await hashPassword('Password123!');

      // User 1
      const user1 = await userRepository.createWithProfile({
        email: 'user1@example.com',
        passwordHash,
        firstName: 'User',
        lastName: 'One',
      });
      await userRepository.adminUpdate(user1.id, { status: AccountStatus.ACTIVE });
      const internalUser1 = (userRepository as any).users.get(user1.id);
      internalUser1.emailVerified = true;

      // User 2
      const user2 = await userRepository.createWithProfile({
        email: 'user2@example.com',
        passwordHash,
        firstName: 'User',
        lastName: 'Two',
      });
      await userRepository.adminUpdate(user2.id, { status: AccountStatus.ACTIVE });
      const internalUser2 = (userRepository as any).users.get(user2.id);
      internalUser2.emailVerified = true;

      // Login User 1
      const login1 = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user1@example.com', password: 'Password123!' });

      // Login User 2 to create their session
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user2@example.com', password: 'Password123!' });

      const user2SessionId = Array.from((sessionRepository as any).sessions.values()).find(
        (s: any) => s.userId === user2.id
      )!.id;

      // Try revoking User 2's session using User 1's token
      const response = await request(app)
        .delete(`/api/v1/auth/sessions/${user2SessionId}`)
        .set('Authorization', `Bearer ${login1.body.data.accessToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/v1/auth/sessions', () => {
    it('should revoke all sessions except the current one', async () => {
      const email = 'john.doe@example.com';
      const password = 'Password123!';
      const passwordHash = await hashPassword(password);

      const user = await userRepository.createWithProfile({
        email,
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
      });
      await userRepository.adminUpdate(user.id, {
        status: AccountStatus.ACTIVE,
      });
      const internalUser = (userRepository as any).users.get(user.id);
      internalUser.emailVerified = true;

      // Session 1
      const login1 = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      // Session 2
      const login2 = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      // Revoke all other sessions using Session 2's token
      const response = await request(app)
        .delete('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${login2.body.data.accessToken}`);

      expect(response.status).toBe(200);

      // Session 1 (other) should be revoked and blocked from refresh
      const refreshResponse1 = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: login1.body.data.refreshToken });
      expect(refreshResponse1.status).toBe(400);

      // Session 2 (current) should still be valid and active
      const refreshResponse2 = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: login2.body.data.refreshToken });
      expect(refreshResponse2.status).toBe(200);
    });
  });
});
