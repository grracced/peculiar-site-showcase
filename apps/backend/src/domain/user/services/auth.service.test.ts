import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from '../../../infrastructure/repositories/in-memory-user.repository';
import { AuthService, InvalidCredentialsError, EmailNotVerifiedError, AccountSuspendedError } from './auth.service';
import { hashPassword } from '../../../utils/password';
import { UserRole, AccountStatus } from '../user.enums';

describe('AuthService', () => {
  let userRepository: InMemoryUserRepository;
  let authService: AuthService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    userRepository.clear();
    authService = new AuthService(userRepository);
  });

  it('should successfully authenticate user with valid credentials', async () => {
    // Setup in-memory mock data
    const email = 'test@example.com';
    const password = 'Password123!';
    const passwordHash = await hashPassword(password);

    // Create the user with profile inside the mock repo
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
    // Update the emailVerified flag directly on the mock database storage since adminUpdate doesn't cover emailVerified
    const internalUser = (userRepository as any).users.get(userWithProfile.id);
    internalUser.emailVerified = true;

    const result = await authService.login({ email, password });

    expect(result).toBeDefined();
    expect(result.id).toBe(userWithProfile.id);
    expect(result.email).toBe(email);
    expect(result.emailVerified).toBe(true);
  });

  it('should fail with InvalidCredentialsError if email is not found', async () => {
    await expect(
      authService.login({ email: 'nonexistent@example.com', password: 'Password123!' })
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('should fail with InvalidCredentialsError if password is incorrect', async () => {
    const email = 'test@example.com';
    const passwordHash = await hashPassword('Password123!');

    const user = await userRepository.createWithProfile({
      email,
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
    });
    const internalUser = (userRepository as any).users.get(user.id);
    internalUser.emailVerified = true;

    await expect(
      authService.login({ email, password: 'WrongPassword!' })
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('should fail with EmailNotVerifiedError if email is unverified', async () => {
    const email = 'test@example.com';
    const password = 'Password123!';
    const passwordHash = await hashPassword(password);

    // Initial status is PENDING_VERIFICATION and emailVerified is false
    await userRepository.createWithProfile({
      email,
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
    });

    await expect(
      authService.login({ email, password })
    ).rejects.toThrow(EmailNotVerifiedError);
  });

  it('should fail with AccountSuspendedError if user status is SUSPENDED', async () => {
    const email = 'test@example.com';
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

    await expect(
      authService.login({ email, password })
    ).rejects.toThrow(AccountSuspendedError);
  });
});
