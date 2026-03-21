import { PrismaClient } from '@prisma/client';

/**
 * Replaces weak SSL modes in a pg connection string with 'verify-full'.
 * Prevents the pg deprecation warning introduced in pg-connection-string v2.7+
 * where 'prefer', 'require', and 'verify-ca' are documented to change semantics
 * in the next major version.
 */
function normalizeSslMode(connectionString: string): string {
  if (!connectionString) return connectionString;
  // Replace sslmode=prefer|require|verify-ca with sslmode=verify-full
  return connectionString.replace(
    /([?&])sslmode=(prefer|require|verify-ca)(\b|&|$)/gi,
    '$1sslmode=verify-full$3'
  );
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// We use `unknown` here rather than `import { Pool } from 'pg'` to prevent
// bundling the pg module for client-side builds.
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  pool: unknown;
};

// Lazy initialization of adapter and pool (server-side only)
function createPrismaClient(): PrismaClient {
  // Only import pg and adapter on the server side
  if (typeof window === 'undefined') {
    // Dynamic imports to avoid bundling for client
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { Pool } = require('pg');

    // Reuse the pool in development to avoid connection exhaustion during hot-reload.
    // We normalise the connection string to use sslmode=verify-full so that pg does
    // not emit a deprecation warning about 'prefer'/'require' becoming weaker in v9.
    const connectionString = normalizeSslMode(process.env.POSTGRES_PRISMA_URL ?? '');
    const pool = (globalForPrisma.pool as InstanceType<typeof Pool>) ||
      new Pool({ connectionString });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.pool = pool;
    }

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  // Guard: this path should never be reached in production.
  // If it is, throw a clear error instead of silently failing.
  throw new Error(
    'PrismaClient cannot be used in a browser context. ' +
    'Move all database access to server components or API routes.'
  );
}

// Initialize Prisma Client — reuse across hot-reloads in development
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
