require('dotenv').config({ path: '.env.local' });
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function main() {
  try {
    console.log('Starting production database migration...');

    // First, create a backup
    console.log('Creating database backup...');
    await execAsync('node scripts/backup-database.js');

    // Reset the migration state
    console.log('Resetting migration state...');
    await execAsync('npx prisma migrate reset --force');

    // Deploy the migration
    console.log('Deploying migration...');
    await execAsync('npx prisma migrate deploy');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    if (error.stderr) {
      console.error('Error details:', error.stderr);
    }
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => {
    console.log('Migration script finished');
  });