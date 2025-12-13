require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs/promises');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_PRISMA_URL,
});

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({ adapter });

// Verify that the environment variable is loaded
console.log('Database URL:', process.env.POSTGRES_PRISMA_URL);

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = './backups';
  const backupFileName = `${backupDir}/backup_${timestamp}.json`;

  // Create backups directory if it doesn't exist
  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  console.log('Starting database backup...');

  const data = {
    users: await prisma.user.findMany(),
    posts: await prisma.post.findMany({
      include: {
        author: true,
        tags: true
      }
    }),
    tags: await prisma.tag.findMany(),
    authorizedPosters: await prisma.authorizedPoster.findMany(),
    accounts: await prisma.account.findMany(),
    sessions: await prisma.session.findMany(),
  };

  await fs.writeFile(backupFileName, JSON.stringify(data, null, 2));
  console.log(`Backup created successfully: ${backupFileName}`);
}

main()
  .catch((e) => {
    console.error('Error creating backup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });