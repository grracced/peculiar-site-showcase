import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { InMemoryUserRepository } from '../src/infrastructure/repositories/in-memory-user.repository';
import { EmailVerificationService } from '../src/domain/user/services/email-verification.service';
import { hashPassword } from '../src/utils/password';
import crypto from 'crypto';

describe('Email Verification Integration Tests (GET /api/v1/auth/verify-email)', () => {
  let userRepository: InMemoryUserRepository;
  let emailVerificationService: EmailVerificationService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    userRepository.clear(); // Flush databases maps
    emailVerificationService = new EmailVerificationService(userRepository);
  });

  it('should successfully verify email when token exists and is valid', async () => {
    const email = 'verify.me@example.com';
    const passwordHash = await hashPassword('Password123!');

    // 1. Create a user
    const userWithProfile = await userRepository.createWithProfile({
      email,
      passwordHash,
      firstName: 'Verify',
      lastName: 'User',
    });

    // 2. Generate token (this hashes and stores it in memory)
    const token = await emailVerificationService.generateAndSaveToken(userWithProfile.id);

    // 3. Perform verification request
    const response = await request(app)
      .get(`/api/v1/auth/verify-email`)
      .query({ token });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.status).toBe(200);
    expect(response.body.message).toBe('Email verified successfully');

    // 4. Verify DB state
    const updatedUser = await userRepository.findById(userWithProfile.id);
    expect(updatedUser?.emailVerified).toBe(true);
    expect(updatedUser?.emailVerifiedAt).not.toBeNull();
  });

  it('should return 400 Bad Request for an invalid/unknown token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/verify-email')
      .query({ token: 'unknown_token_hash_here' });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe(400);
    expect(response.body.error).toBe('Bad Request');
    expect(response.body.message).toBe('The verification link is invalid.');
  });

  it('should return 400 Bad Request for an expired verification token', async () => {
    const email = 'verify.me@example.com';
    const passwordHash = await hashPassword('Password123!');

    const userWithProfile = await userRepository.createWithProfile({
      email,
      passwordHash,
      firstName: 'Verify',
      lastName: 'User',
    });

    const token = await emailVerificationService.generateAndSaveToken(userWithProfile.id);
    
    // Simulate expiration in the database
    const expiredDate = new Date();
    expiredDate.setHours(expiredDate.getHours() - 1);
    await userRepository.updateVerificationToken(
      userWithProfile.id,
      crypto.createHash('sha256').update(token).digest('hex'),
      expiredDate
    );

    const response = await request(app)
      .get('/api/v1/auth/verify-email')
      .query({ token });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe(400);
    expect(response.body.message).toBe('The verification link has expired.');
  });

  it('should return 200 indicating already verified for verified user duplicate click', async () => {
    const email = 'verify.me@example.com';
    const passwordHash = await hashPassword('Password123!');

    const userWithProfile = await userRepository.createWithProfile({
      email,
      passwordHash,
      firstName: 'Verify',
      lastName: 'User',
    });

    const token = await emailVerificationService.generateAndSaveToken(userWithProfile.id);

    // Simulate verified user status while still keeping token mapped for duplicates checks
    await userRepository.verifyEmail(userWithProfile.id, new Date());
    // Since verifyEmail clears the token in the real DB flow, to test a duplicate click 
    // where the server checks `user.emailVerified` directly if the token hash is somehow matching or matched:
    // We update the token hash back to verify the alreadyVerified branches:
    await userRepository.updateVerificationToken(
      userWithProfile.id,
      crypto.createHash('sha256').update(token).digest('hex'),
      new Date(Date.now() + 1000 * 60 * 60)
    );

    const response = await request(app)
      .get('/api/v1/auth/verify-email')
      .query({ token });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(200);
    expect(response.body.message).toBe('Email has already been verified');
  });
});
