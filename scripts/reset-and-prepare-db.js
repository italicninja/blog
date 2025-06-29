require('dotenv').config({ path: '.env.local' });
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function main() {
  try {
    console.log('Starting database reset and preparation...');

    // Reset the migration state (this will drop all tables)
    console.log('Resetting migration state...');
    await execAsync('npx prisma migrate reset --force');

    // Deploy the migration to create the latest schema
    console.log('Deploying migration...');
    await execAsync('npx prisma migrate deploy');

    // Clear any existing data (if needed)
    console.log('Clearing existing data...');
    await execAsync('npx prisma db push --force-reset');

    console.log('Database reset and prepared successfully!');
    console.log('You can now restore the backup using the backup restoration script.');
  } catch (error) {
    console.error('Error during database reset and preparation:', error);
    if (error.stderr) {
      console.error('Error details:', error.stderr);
    }
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => {
    console.log('Reset and preparation script finished');
  });