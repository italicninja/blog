import prisma from './prisma';
import { isOwner } from './auth-utils';

/**
 * Check if a GitHub user is authorized to post
 * @param githubLogin The GitHub login username to check
 * @returns Boolean indicating if the user is authorized
 */
export async function isAuthorizedPoster(githubLogin: string): Promise<boolean> {
  if (!githubLogin) return false;

  // Special case for blog owner - always authorized
  if (isOwner(githubLogin)) return true;

  try {
    // Check if the GitHub login exists in the AuthorizedPoster table using raw SQL
    const authorizedPosters = await prisma.$queryRaw`
      SELECT * FROM "AuthorizedPoster" WHERE "githubLogin" = ${githubLogin}
    `;
    
    return Array.isArray(authorizedPosters) && authorizedPosters.length > 0;
  } catch (error) {
    console.error('Error checking authorized poster status:', error);
    return false;
  }
}

/**
 * Add a GitHub user to the authorized posters list
 * @param githubLogin The GitHub login username to authorize
 * @param options Additional authorization options
 * @returns The created AuthorizedPoster record or null if failed
 */
export async function addAuthorizedPoster(
  githubLogin: string,
  options?: {
    isPermanent?: boolean;
    permissionLevel?: 'contributor' | 'editor' | 'admin';
    canPublish?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    authorizedBy?: string;
  }
) {
  if (!githubLogin) return null;
  
  try {
    // Set default values
    const isPermanent = options?.isPermanent ?? false;
    const permissionLevel = options?.permissionLevel ?? 'contributor';
    const canPublish = options?.canPublish ?? true;
    const canEdit = options?.canEdit ?? true;
    const canDelete = options?.canDelete ?? false;
    const authorizedBy = options?.authorizedBy ?? 'system';

    // Create the authorized poster using raw SQL
    await prisma.$executeRaw`
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
        ${isPermanent},
        ${permissionLevel},
        ${canPublish},
        ${canEdit},
        ${canDelete},
        NOW(),
        NOW(),
        NOW(),
        ${authorizedBy}
      )
    `;

    // Return the newly created poster
    const newPosters = await prisma.$queryRaw`
      SELECT * FROM "AuthorizedPoster" WHERE "githubLogin" = ${githubLogin}
    `;

    return Array.isArray(newPosters) && newPosters.length > 0 ? newPosters[0] : null;
  } catch (error) {
    console.error('Error adding authorized poster:', error);
    return null;
  }
}

/**
 * Remove a GitHub user from the authorized posters list
 * @param githubLogin The GitHub login username to remove
 * @returns Boolean indicating if the removal was successful
 */
export async function removeAuthorizedPoster(githubLogin: string): Promise<boolean> {
  if (!githubLogin) return false;
  
  try {
    // Delete the authorized poster using raw SQL
    const result = await prisma.$executeRaw`
      DELETE FROM "AuthorizedPoster" WHERE "githubLogin" = ${githubLogin}
    `;
    
    return result > 0;
  } catch (error) {
    console.error('Error removing authorized poster:', error);
    return false;
  }
}

/**
 * Get all authorized posters
 * @returns Array of authorized poster records
 */
export async function getAllAuthorizedPosters() {
  try {
    // Get all authorized posters using raw SQL
    return await prisma.$queryRaw`
      SELECT * FROM "AuthorizedPoster" ORDER BY "githubLogin" ASC
    `;
  } catch (error) {
    console.error('Error getting authorized posters:', error);
    return [];
  }
}

/**
 * Update an authorized poster's permissions
 * @param githubLogin The GitHub login username to update
 * @param updates The permission updates to apply
 * @returns The updated AuthorizedPoster record or null if failed
 */
export async function updateAuthorizedPoster(
  githubLogin: string,
  updates: {
    isPermanent?: boolean;
    permissionLevel?: 'contributor' | 'editor' | 'admin';
    canPublish?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    authorizedBy?: string;
  }
) {
  if (!githubLogin) return null;

  try {
    // Use separate update queries for each field to avoid dynamic SQL issues
    if (updates.isPermanent !== undefined) {
      await prisma.$executeRaw`
        UPDATE "AuthorizedPoster"
        SET "isPermanent" = ${updates.isPermanent}
        WHERE "githubLogin" = ${githubLogin}
      `;
    }

    if (updates.permissionLevel) {
      await prisma.$executeRaw`
        UPDATE "AuthorizedPoster"
        SET "permissionLevel" = ${updates.permissionLevel}
        WHERE "githubLogin" = ${githubLogin}
      `;
    }

    if (updates.canPublish !== undefined) {
      await prisma.$executeRaw`
        UPDATE "AuthorizedPoster"
        SET "canPublish" = ${updates.canPublish}
        WHERE "githubLogin" = ${githubLogin}
      `;
    }

    if (updates.canEdit !== undefined) {
      await prisma.$executeRaw`
        UPDATE "AuthorizedPoster"
        SET "canEdit" = ${updates.canEdit}
        WHERE "githubLogin" = ${githubLogin}
      `;
    }

    if (updates.canDelete !== undefined) {
      await prisma.$executeRaw`
        UPDATE "AuthorizedPoster"
        SET "canDelete" = ${updates.canDelete}
        WHERE "githubLogin" = ${githubLogin}
      `;
    }

    if (updates.authorizedBy) {
      await prisma.$executeRaw`
        UPDATE "AuthorizedPoster"
        SET "authorizedBy" = ${updates.authorizedBy}
        WHERE "githubLogin" = ${githubLogin}
      `;
    }

    // Always update these fields
    await prisma.$executeRaw`
      UPDATE "AuthorizedPoster"
      SET
        "lastAuthorizedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE "githubLogin" = ${githubLogin}
    `;

    // Return the updated poster
    const updatedPosters = await prisma.$queryRaw`
      SELECT * FROM "AuthorizedPoster" WHERE "githubLogin" = ${githubLogin}
    `;

    return Array.isArray(updatedPosters) && updatedPosters.length > 0 ? updatedPosters[0] : null;
  } catch (error) {
    console.error('Error updating authorized poster:', error);
    return null;
  }
}

/**
 * Check if a GitHub user has specific permissions
 * @param githubLogin The GitHub login username to check
 * @param permission The permission to check for
 * @returns Boolean indicating if the user has the specified permission
 */
export async function hasPermission(
  githubLogin: string,
  permission: 'publish' | 'edit' | 'delete' | 'admin'
): Promise<boolean> {
  if (!githubLogin) return false;

  // Special case for blog owner - always grant all permissions
  if (isOwner(githubLogin)) return true;

  try {
    // Get the authorized poster using raw SQL
    const posters = await prisma.$queryRaw`
      SELECT * FROM "AuthorizedPoster" WHERE "githubLogin" = ${githubLogin}
    `;

    if (!Array.isArray(posters) || posters.length === 0) return false;

    const poster = posters[0];

    switch (permission) {
      case 'publish':
        return poster.canPublish;
      case 'edit':
        return poster.canEdit;
      case 'delete':
        return poster.canDelete;
      case 'admin':
        return poster.permissionLevel === 'admin';
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Grant permanent publishing access to a GitHub user
 * @param githubLogin The GitHub login username to grant permanent access
 * @param grantedBy The GitHub login of the user granting the permission
 * @returns The updated AuthorizedPoster record or null if failed
 */
export async function grantPermanentAccess(
  githubLogin: string,
  grantedBy?: string
): Promise<any> {
  if (!githubLogin) return null;

  try {
    // Check if the user is already an authorized poster
    const existingPosters = await prisma.$queryRaw`
      SELECT * FROM "AuthorizedPoster" WHERE "githubLogin" = ${githubLogin}
    `;

    const authorizedBy = grantedBy || 'system';

    if (Array.isArray(existingPosters) && existingPosters.length > 0) {
      // Update the existing poster with permanent access
      await prisma.$executeRaw`
        UPDATE "AuthorizedPoster"
        SET
          "isPermanent" = true,
          "canPublish" = true,
          "canEdit" = true,
          "permissionLevel" = 'editor',
          "lastAuthorizedAt" = NOW(),
          "authorizedBy" = ${authorizedBy},
          "updatedAt" = NOW()
        WHERE "githubLogin" = ${githubLogin}
      `;
    } else {
      // Create a new authorized poster with permanent access
      await prisma.$executeRaw`
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
          'editor',
          true,
          true,
          false,
          NOW(),
          NOW(),
          NOW(),
          ${authorizedBy}
        )
      `;
    }

    // Return the updated poster
    const updatedPosters = await prisma.$queryRaw`
      SELECT * FROM "AuthorizedPoster" WHERE "githubLogin" = ${githubLogin}
    `;

    return Array.isArray(updatedPosters) && updatedPosters.length > 0 ? updatedPosters[0] : null;
  } catch (error) {
    console.error('Error granting permanent access:', error);
    return null;
  }
}