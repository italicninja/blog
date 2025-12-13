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

// Helper function to normalize enum values
function normalizeEnumValue(value) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value;
}

async function upsertRecord(model, data, uniqueFields, isPost = false) {
  try {
    const where = Object.fromEntries(uniqueFields.map(field => [field, data[field]]));
    const { published, ...restData } = data;

    // Only add status for Post model
    const upsertData = isPost ? {
      ...restData,
      status: published ? 'PUBLISHED' : 'DRAFT'
    } : restData;

    await model.upsert({
      where,
      update: upsertData,
      create: upsertData,
    });
  } catch (error) {
    console.error(`Error upserting record:`, error);
  }
}

async function main() {
  const backupFile = './backups/backup_2025-06-29T06-04-09-741Z.json';

  console.log('Starting database restoration...');
  console.log(`Reading backup from: ${backupFile}`);

  try {
    // Read the backup file
    const backupData = JSON.parse(await fs.readFile(backupFile, 'utf-8'));

    // Restore data in the correct order to maintain referential integrity
    console.log('Restoring users...');
    for (const user of backupData.users) {
      await upsertRecord(prisma.user, {
        ...user,
        accounts: undefined,
        sessions: undefined,
        posts: undefined
      }, ['id']);
    }

    console.log('Restoring tags...');
    for (const tag of backupData.tags) {
      await upsertRecord(prisma.tag, {
        ...tag,
        posts: undefined
      }, ['id', 'name']);
    }

    console.log('Restoring authorized posters...');
    for (const poster of backupData.authorizedPosters) {
      await upsertRecord(prisma.authorizedPoster, {
        ...poster,
        permissionLevel: normalizeEnumValue(poster.permissionLevel)
      }, ['id', 'githubLogin']);
    }

    console.log('Restoring accounts...');
    for (const account of backupData.accounts) {
      await upsertRecord(prisma.account, account, ['id', 'provider', 'providerAccountId']);
    }

    console.log('Restoring sessions...');
    for (const session of backupData.sessions) {
      await upsertRecord(prisma.session, session, ['id', 'sessionToken']);
    }

    console.log('Restoring posts...');
    for (const post of backupData.posts) {
      const tagNames = post.tags.map(tag => tag.name);
      await upsertRecord(prisma.post, {
        ...post,
        author: undefined,
        tags: {
          connect: tagNames.map(name => ({ name }))
        }
      }, ['id', 'slug'], true);
    }

    console.log('Database restoration completed successfully!');
  } catch (error) {
    console.error('Error during database restoration:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('Error restoring backup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });