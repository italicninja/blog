// This script adds an authorized poster to the database
// Usage: node scripts/add-authorized-poster.js <github-username>

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addAuthorizedPoster(githubLogin) {
  if (!githubLogin) {
    console.error('Error: GitHub username is required');
    console.log('Usage: node scripts/add-authorized-poster.js <github-username>');
    process.exit(1);
  }

  try {
    // Check if the poster already exists
    const existingPoster = await prisma.authorizedPoster.findUnique({
      where: {
        githubLogin,
      },
    });

    if (existingPoster) {
      console.log(`${githubLogin} is already an authorized poster`);
      process.exit(0);
    }

    // Add the authorized poster
    const authorizedPoster = await prisma.authorizedPoster.create({
      data: {
        githubLogin,
      },
    });

    console.log(`Successfully added ${githubLogin} as an authorized poster`);
    console.log(authorizedPoster);
  } catch (error) {
    console.error('Error adding authorized poster:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get the GitHub username from the command line arguments
const githubLogin = process.argv[2];
addAuthorizedPoster(githubLogin);