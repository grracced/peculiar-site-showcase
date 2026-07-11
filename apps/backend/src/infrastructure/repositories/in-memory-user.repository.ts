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

    const newUser: User & { passwordHash: string } = {
      id: userId,
      email: data.email.toLowerCase().trim(),
      role: UserRole.USER,
      status: AccountStatus.PENDING_VERIFICATION,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      passwordHash: data.passwordHash,
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

  /**
   * Clears all in-memory users and profiles.
   * Primarily used for unit testing to avoid cross-test state contamination.
   */
  clear(): void {
    InMemoryUserRepository.usersMap.clear();
    InMemoryUserRepository.profilesMap.clear();
  }
}
