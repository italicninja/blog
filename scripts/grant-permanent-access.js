// This script grants permanent publishing access to a GitHub user
// Usage: node scripts/grant-permanent-access.js <github-username>

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function grantPermanentAccess(githubLogin) {
  if (!githubLogin) {
    console.error('Error: GitHub username is required');
    console.log('Usage: node scripts/grant-permanent-access.js <github-username>');
    process.exit(1);
  }

  try {
    // Check if the user is already an authorized poster using raw SQL
    const existingPosters = await prisma.$queryRaw`
      SELECT * FROM "AuthorizedPoster" WHERE "githubLogin" = ${githubLogin}
    `;
    
    if (existingPosters && existingPosters.length > 0) {
      // Update the existing poster with permanent access
      const updatedPoster = await prisma.$executeRaw`
        UPDATE "AuthorizedPoster"
        SET 
          "isPermanent" = true,
          "permissionLevel" = 'admin',
          "canPublish" = true,
          "canEdit" = true,
          "canDelete" = true,
          "lastAuthorizedAt" = NOW(),
          "authorizedBy" = 'system',
          "updatedAt" = NOW()
        WHERE "githubLogin" = ${githubLogin}
      `;
      
      console.log(`Successfully granted permanent access to ${githubLogin}`);
      console.log(`Updated ${updatedPoster} record(s)`);
    } else {
      // Create a new authorized poster with permanent access
      const newPoster = await prisma.$executeRaw`
        INSERT INTO "AuthorizedPoster" (
          "id", 
          "githubLogin", 
          "isPermanent", 
          "permissionLevel", 
          "canPublish", 
          "canEdit", 
          "canDelete", 
          "createdAt", 
          "updatedAt", 
          "lastAuthorizedAt", 
          "authorizedBy"
        ) VALUES (
          gen_random_uuid(), 
          ${githubLogin}, 
          true, 
          'admin', 
          true, 
          true, 
          true, 
          NOW(), 
          NOW(), 
          NOW(), 
          'system'
        )
      `;
      
      console.log(`Successfully added ${githubLogin} as a permanent authorized poster`);
      console.log(`Created ${newPoster} record(s)`);
    }
    
    // Verify the user now has permanent access
    const verifyPoster = await prisma.$queryRaw`
      SELECT * FROM "AuthorizedPoster" WHERE "githubLogin" = ${githubLogin}
    `;
    
    console.log('Verification:');
    console.log(verifyPoster);
  } catch (error) {
    console.error('Error granting permanent access:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get the GitHub username from the command line arguments
const githubLogin = process.argv[2] || 'italicninja';
grantPermanentAccess(githubLogin);