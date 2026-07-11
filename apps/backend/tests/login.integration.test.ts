import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { InMemoryUserRepository } from '../src/infrastructure/repositories/in-memory-user.repository';
import { hashPassword } from '../src/utils/password';
import { UserRole, AccountStatus } from '../src/domain/user/user.enums';

describe('Auth Integration Tests (POST /api/v1/auth/login)', () => {
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    userRepository.clear(); // Reset shared state database maps
  });

  it('should successfully authenticate user with valid credentials', async () => {
    const email = 'john.doe@example.com';
    const password = 'Password123!';
    const passwordHash = await hashPassword(password);

    // Create user and profile
    const userWithProfile = await userRepository.createWithProfile({
      email,
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
    });

    // Mark email as verified and status as active to simulate verified flow
    await userRepository.adminUpdate(userWithProfile.id, {
      role: UserRole.USER,
      status: AccountStatus.ACTIVE,
    });
    // Set emailVerified flag directly on the mock database storage
    const internalUser = (userRepository as any).users.get(userWithProfile.id);
    internalUser.emailVerified = true;

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.status).toBe(200);
    expect(response.body.message).toBe('User logged in successfully');
    
    // AuthResponse DTO validation
    const { data } = response.body;
    expect(data.userId).toBe(userWithProfile.id);
    expect(data.email).toBe(email);
    expect(data.fullName).toBe('John Doe');
    expect(data.role).toBe(UserRole.USER);
    expect(data.emailVerified).toBe(true);
    expect(data.passwordHash).toBeUndefined(); // Verify sensitive fields are redacted
  });

  it('should return 401 Unauthorized for incorrect password', async () => {
    const email = 'john.doe@example.com';
    const passwordHash = await hashPassword('Password123!');

    const user = await userRepository.createWithProfile({
      email,
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
    });
    const internalUser = (userRepository as any).users.get(user.id);
    internalUser.emailVerified = true;

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPassword!' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
    expect(response.body.message).toBe('Invalid email or password');
  });

  it('should return 401 Unauthorized for unknown email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'Password123!' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
    expect(response.body.message).toBe('Invalid email or password');
  });

  it('should return 403 Forbidden for unverified email address', async () => {
    const email = 'john.doe@example.com';
    const password = 'Password123!';
    const passwordHash = await hashPassword(password);

    // Initial state has emailVerified = false
    await userRepository.createWithProfile({
      email,
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden');
    expect(response.body.message).toBe('Email address has not been verified');
  });

  it('should return 403 Forbidden for suspended user account', async () => {
    const email = 'john.doe@example.com';
    const password = 'Password123!';
    const passwordHash = await hashPassword(password);

    const userWithProfile = await userRepository.createWithProfile({
      email,
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
    });

    // Suspend user
    await userRepository.adminUpdate(userWithProfile.id, {
      status: AccountStatus.SUSPENDED,
    });
    const internalUser = (userRepository as any).users.get(userWithProfile.id);
    internalUser.emailVerified = true;

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden');
    expect(response.body.message).toBe('Account has been suspended');
  });
});
