import { IUserRepository } from '../../domain/user/user.repository';
import { User, UserProfile, UserWithProfile } from '../../domain/user/user.entity';
import { UserRole, AccountStatus, SubscriptionTier } from '../../domain/user/user.enums';
import { CreateUserInput, UpdateUserProfileInput, AdminUpdateUserInput } from '../../domain/user/user.schema';
import crypto from 'crypto';

/**
 * An in-memory implementation of the IUserRepository interface.
 * Used for testing and local scaffolding before connecting PostgreSQL/Prisma.
 */
export class InMemoryUserRepository implements IUserRepository {
  private static readonly usersMap = new Map<string, User & { passwordHash?: string }>();
  private static readonly profilesMap = new Map<string, UserProfile>();

  private get users() {
    return InMemoryUserRepository.usersMap;
  }

  private get profiles() {
    return InMemoryUserRepository.profilesMap;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    if (!user || user.deletedAt !== null) {
      return null;
    }
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase().trim() === normalizedEmail && u.deletedAt === null
    );
    if (!user) {
      return null;
    }
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getPasswordHashByEmail(email: string): Promise<string | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase().trim() === normalizedEmail && u.deletedAt === null
    );
    return user?.passwordHash || null;
  }

  async findWithProfile(id: string): Promise<UserWithProfile | null> {
    const user = await this.findById(id);
    if (!user) {
      return null;
    }
    const profile = Array.from(this.profiles.values()).find((p) => p.userId === id) || null;
    return {
      ...user,
      profile,
    };
  }

  async create(data: CreateUserInput): Promise<User> {
    const userId = crypto.randomUUID();
    const newUser: User = {
      id: userId,
      email: data.email.toLowerCase().trim(),
      role: UserRole.USER,
      status: AccountStatus.PENDING_VERIFICATION,
      emailVerified: false,
      emailVerifiedAt: null,
      passwordChangedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    this.users.set(userId, newUser);
    return newUser;
  }

  async createWithProfile(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): Promise<UserWithProfile> {
    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();

    const newUser: User & {
      passwordHash: string;
      verificationTokenHash?: string | null;
      verificationTokenExpiresAt?: Date | null;
      passwordResetTokenHash?: string | null;
      passwordResetExpiresAt?: Date | null;
    } = {
      id: userId,
      email: data.email.toLowerCase().trim(),
      role: UserRole.USER,
      status: AccountStatus.PENDING_VERIFICATION,
      emailVerified: false,
      emailVerifiedAt: null,
      passwordChangedAt: null,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      passwordHash: data.passwordHash,
      verificationTokenHash: null,
      verificationTokenExpiresAt: null,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    };

    const newProfile: UserProfile = {
      id: profileId,
      userId,
      fullName: `${data.firstName} ${data.lastName}`,
      avatarUrl: null,
      subscriptionTier: SubscriptionTier.FREE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(userId, newUser);
    this.profiles.set(profileId, newProfile);

    return {
      ...newUser,
      profile: newProfile,
    };
  }

  async updateProfile(userId: string, data: UpdateUserProfileInput): Promise<UserProfile> {
    const profile = Array.from(this.profiles.values()).find((p) => p.userId === userId);
    if (!profile) {
      throw new Error(`Profile not found for user: ${userId}`);
    }

    const updatedProfile: UserProfile = {
      ...profile,
      fullName: data.fullName !== undefined ? data.fullName : profile.fullName,
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : profile.avatarUrl,
      updatedAt: new Date(),
    };

    this.profiles.set(updatedProfile.id, updatedProfile);
    return updatedProfile;
  }

  async adminUpdate(userId: string, data: AdminUpdateUserInput): Promise<User> {
    const user = this.users.get(userId);
    if (!user || user.deletedAt !== null) {
      throw new Error(`User not found: ${userId}`);
    }

    const updatedUser = {
      ...user,
      role: data.role !== undefined ? data.role : user.role,
      status: data.status !== undefined ? data.status : user.status,
      updatedAt: new Date(),
    };

    this.users.set(userId, updatedUser);
    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async softDelete(id: string): Promise<void> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }

    this.users.set(id, {
      ...user,
      deletedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async updateVerificationToken(userId: string, tokenHash: string | null, expiresAt: Date | null): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    this.users.set(userId, {
      ...user,
      verificationTokenHash: tokenHash,
      verificationTokenExpiresAt: expiresAt,
      updatedAt: new Date(),
    } as any);
  }

  async findByVerificationTokenHash(tokenHash: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(
      (u: any) => u.verificationTokenHash === tokenHash && u.deletedAt === null
    );
    if (!user) {
      return null;
    }
    const { passwordHash, verificationTokenHash, verificationTokenExpiresAt, ...userWithoutSecrets } = user as any;
    return userWithoutSecrets;
  }

  async verifyEmail(userId: string, verifiedAt: Date): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const updatedUser = {
      ...user,
      emailVerified: true,
      emailVerifiedAt: verifiedAt,
      status: AccountStatus.ACTIVE,
      verificationTokenHash: null,
      verificationTokenExpiresAt: null,
      updatedAt: new Date(),
    };

    this.users.set(userId, updatedUser);
    const { passwordHash, ...userWithoutSecrets } = updatedUser as any;
    return userWithoutSecrets;
  }

  async getVerificationExpiry(userId: string): Promise<Date | null> {
    const user: any = this.users.get(userId);
    return user?.verificationTokenExpiresAt || null;
  }

  async updatePasswordResetToken(userId: string, tokenHash: string | null, expiresAt: Date | null): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    this.users.set(userId, {
      ...user,
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
      updatedAt: new Date(),
    } as any);
  }

  async findByPasswordResetTokenHash(tokenHash: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(
      (u: any) => u.passwordResetTokenHash === tokenHash && u.deletedAt === null
    );
    if (!user) {
      return null;
    }
    const { passwordHash, verificationTokenHash, verificationTokenExpiresAt, passwordResetTokenHash, passwordResetExpiresAt, ...userWithoutSecrets } = user as any;
    return userWithoutSecrets;
  }

  async resetPassword(userId: string, passwordHash: string, changedAt: Date): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const updatedUser = {
      ...user,
      passwordHash,
      passwordChangedAt: changedAt,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      updatedAt: new Date(),
    };

    this.users.set(userId, updatedUser);
    const { passwordHash: _, ...userWithoutSecrets } = updatedUser as any;
    return userWithoutSecrets;
  }

  async getPasswordResetExpiry(userId: string): Promise<Date | null> {
    const user: any = this.users.get(userId);
    return user?.passwordResetExpiresAt || null;
  }

  private static readonly passwordHistoriesMap = new Map<string, string[]>();

  private get passwordHistories(): Map<string, string[]> {
    return InMemoryUserRepository.passwordHistoriesMap;
  }

  async incrementFailedAttempts(userId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    const attempts = (user.failedLoginAttempts || 0) + 1;
    const updated = {
      ...user,
      failedLoginAttempts: attempts,
      updatedAt: new Date(),
    };
    this.users.set(userId, updated);
    const { passwordHash, ...userWithoutSecrets } = updated as any;
    return userWithoutSecrets;
  }

  async lockAccount(userId: string, lockoutUntil: Date): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    const updated = {
      ...user,
      lockoutUntil,
      updatedAt: new Date(),
    };
    this.users.set(userId, updated);
    const { passwordHash, ...userWithoutSecrets } = updated as any;
    return userWithoutSecrets;
  }

  async resetFailedAttempts(userId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    const updated = {
      ...user,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      updatedAt: new Date(),
    };
    this.users.set(userId, updated);
    const { passwordHash, ...userWithoutSecrets } = updated as any;
    return userWithoutSecrets;
  }

  async getPasswordHistory(userId: string): Promise<string[]> {
    return this.passwordHistories.get(userId) || [];
  }

  async addPasswordHistoryEntry(userId: string, passwordHash: string): Promise<void> {
    const history = this.passwordHistories.get(userId) || [];
    history.push(passwordHash);
    if (history.length > 5) {
      history.shift();
    }
    this.passwordHistories.set(userId, history);
  }

  /**
   * Clears all in-memory users and profiles.
   * Primarily used for unit testing to avoid cross-test state contamination.
   */
  clear(): void {
    InMemoryUserRepository.usersMap.clear();
    InMemoryUserRepository.profilesMap.clear();
    InMemoryUserRepository.passwordHistoriesMap.clear();
  }
}
