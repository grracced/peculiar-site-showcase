/**
 * Prisma Client Singleton
 *
 * Exports a single, shared instance of PrismaClient for the entire application.
 *
 * WHY A SINGLETON?
 * In Node.js, each import of `new PrismaClient()` opens a new connection pool.
 * In development with hot-reload (tsx watch), module re-evaluation causes
 * multiple pools to pile up and exhaust the Postgres connection limit.
 * The singleton pattern caches the instance in `globalThis` during development
 * so that hot-reloads reuse the same connection pool.
 *
 * In production, the module is only evaluated once and a fresh instance is used.
 */

import { PrismaClient } from '@prisma/client';

const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

// Declare the global type to avoid TypeScript errors on `globalThis`.
declare global {
  // eslint-disable-next-line no-var
  var _prismaClient: PrismaClient | undefined;
}

/**
 * The application's Prisma client instance.
 * Import this throughout the codebase; never instantiate PrismaClient directly.
 *
 * @example
 * import { prisma } from '@/infrastructure/database/prisma.client';
 * const user = await prisma.user.findUnique({ where: { id } });
 */
export const prisma: PrismaClient =
  globalThis._prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis._prismaClient = prisma;
}
