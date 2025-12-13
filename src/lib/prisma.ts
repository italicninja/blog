import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Type declarations
type PoolType = any; // We avoid importing Pool type to prevent bundling issues

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pool: PoolType;
};

// Lazy initialization of adapter and pool (server-side only)
function createPrismaClient() {
  // Only import pg and adapter on the server side
  if (typeof window === 'undefined') {
    // Dynamic imports to avoid bundling for client
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { Pool } = require('pg');

    // Create PostgreSQL connection pool
    const pool = globalForPrisma.pool || new Pool({
      connectionString: process.env.POSTGRES_PRISMA_URL,
    });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.pool = pool;
    }

    // Create Prisma adapter for PostgreSQL
    const adapter = new PrismaPg(pool);

    // Initialize Prisma Client with adapter
    return new PrismaClient({ adapter });
  }

  // Fallback for client-side (should never be used)
  return new PrismaClient();
}

// Initialize Prisma Client
export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;