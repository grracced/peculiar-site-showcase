import crypto from 'crypto';
import { ISessionRepository } from '../../domain/user/session.repository';
import { UserSession } from '../../domain/user/user-session.entity';

export class InMemorySessionRepository implements ISessionRepository {
  private static readonly sessionsMap = new Map<string, UserSession>();

  private get sessions(): Map<string, UserSession> {
    return InMemorySessionRepository.sessionsMap;
  }

  async create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    deviceName: string | null;
    ipAddress: string | null;
    userAgent: string | null;
  }): Promise<UserSession> {
    const id = crypto.randomUUID();
    const newSession: UserSession = {
      id,
      userId: data.userId,
      tokenHash: data.tokenHash,
      issuedAt: new Date(),
      expiresAt: data.expiresAt,
      revokedAt: null,
      lastUsedAt: new Date(),
      deviceName: data.deviceName,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    };
    this.sessions.set(id, newSession);
    return newSession;
  }

  async findByTokenHash(tokenHash: string): Promise<UserSession | null> {
    const session = Array.from(this.sessions.values()).find(
      (s) => s.tokenHash === tokenHash && s.revokedAt === null
    );
    return session || null;
  }

  async findById(id: string): Promise<UserSession | null> {
    return this.sessions.get(id) || null;
  }

  async updateSession(id: string, data: { tokenHash: string; lastUsedAt: Date }): Promise<void> {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`Session not found: ${id}`);
    }
    this.sessions.set(id, {
      ...session,
      tokenHash: data.tokenHash,
      lastUsedAt: data.lastUsedAt,
    });
  }

  async revoke(id: string, date: Date): Promise<void> {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`Session not found: ${id}`);
    }
    this.sessions.set(id, {
      ...session,
      revokedAt: date,
    });
  }

  async revokeAllForUser(userId: string, excludeSessionId?: string): Promise<void> {
    const now = new Date();
    for (const [id, session] of this.sessions.entries()) {
      if (session.userId === userId && session.revokedAt === null) {
        if (excludeSessionId && id === excludeSessionId) {
          continue;
        }
        this.sessions.set(id, {
          ...session,
          revokedAt: now,
        });
      }
    }
  }

  async findActiveByUserId(userId: string): Promise<UserSession[]> {
    const now = new Date();
    return Array.from(this.sessions.values()).filter(
      (s) => s.userId === userId && s.revokedAt === null && s.expiresAt > now
    );
  }

  clear(): void {
    this.sessions.clear();
  }
}
