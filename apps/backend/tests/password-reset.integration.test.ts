import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { InMemoryUserRepository } from '../src/infrastructure/repositories/in-memory-user.repository';
import { PasswordResetService } from '../src/domain/user/services/password-reset.service';
import { MockEmailService } from '../src/infrastructure/email/mock-email.service';
import { hashPassword } from '../src/utils/password';
import crypto from 'crypto';

describe('Password Reset Integration Tests', () => {
  let userRepository: InMemoryUserRepository;
  let emailService: MockEmailService;
  let passwordResetService: PasswordResetService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    userRepository.clear(); // Reset database mock
    emailService = new MockEmailService();
    passwordResetService = new PasswordResetService(userRepository, emailService);
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should return 200 OK for an existing user and generate reset token', async () => {
      const email = 'john.doe@example.com';
      await userRepository.createWithProfile({
        email,
        passwordHash: await hashPassword('Password123!'),
        firstName: 'John',
        lastName: 'Doe',
      });

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('If the email is registered, a password reset link has been sent.');

      // Check user now has a password reset token in database
      const user = await userRepository.findByEmail(email);
      const internalUser = (userRepository as any).users.get(user?.id);
      expect(internalUser.passwordResetTokenHash).not.toBeNull();
      expect(internalUser.passwordResetExpiresAt).not.toBeNull();
    });

    it('should return 200 OK for an unknown user (no user details exposed)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'unknown.user@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('If the email is registered, a password reset link has been sent.');
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('should successfully reset password with valid token and strong new password', async () => {
      const email = 'john.doe@example.com';
      const user = await userRepository.createWithProfile({
        email,
        passwordHash: await hashPassword('Password123!'),
        firstName: 'John',
        lastName: 'Doe',
      });

      // Generate plaintext token
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1);

      await userRepository.updatePasswordResetToken(user.id, tokenHash, expiry);

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token,
          newPassword: 'NewPassword99!',
          confirmPassword: 'NewPassword99!',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password reset successfully.');

      // Verify DB state
      const internalUser = (userRepository as any).users.get(user.id);
      expect(internalUser.passwordResetTokenHash).toBeNull();
      expect(internalUser.passwordResetExpiresAt).toBeNull();
      expect(internalUser.passwordChangedAt).not.toBeNull();
    });

    it('should return 400 Bad Request for an invalid/unknown reset token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'invalid_reset_token',
          newPassword: 'NewPassword99!',
          confirmPassword: 'NewPassword99!',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('The verification link is invalid.');
    });

    it('should return 400 Bad Request for an expired reset token', async () => {
      const email = 'john.doe@example.com';
      const user = await userRepository.createWithProfile({
        email,
        passwordHash: await hashPassword('Password123!'),
        firstName: 'John',
        lastName: 'Doe',
      });

      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      // Simulate expired token
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - 1);
      await userRepository.updatePasswordResetToken(user.id, tokenHash, expiredDate);

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token,
          newPassword: 'NewPassword99!',
          confirmPassword: 'NewPassword99!',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('The verification link has expired.');
    });

    it('should return 400 Bad Request for validation error: passwords mismatch', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'some_token',
          newPassword: 'NewPassword99!',
          confirmPassword: 'DifferentPassword99!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Error');
      // Zod validation messages are output in formatted schema errors
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 Bad Request for validation error: weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'some_token',
          newPassword: 'weak',
          confirmPassword: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Error');
      expect(response.body.details).toBeDefined();
    });

    it('should block reuse of already-used token', async () => {
      const email = 'john.doe@example.com';
      const user = await userRepository.createWithProfile({
        email,
        passwordHash: await hashPassword('Password123!'),
        firstName: 'John',
        lastName: 'Doe',
      });

      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1);

      await userRepository.updatePasswordResetToken(user.id, tokenHash, expiry);

      // 1. Success reset
      await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token,
          newPassword: 'NewPassword99!',
          confirmPassword: 'NewPassword99!',
        });

      // 2. Try reuse same token
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token,
          newPassword: 'AnotherPassword99!',
          confirmPassword: 'AnotherPassword99!',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('The verification link is invalid.');
    });
  });
});
