import prisma from './prisma';
import { isOwner } from './auth-utils';
import type { AuthorizedPoster } from '@prisma/client';

/**
 * Check if a GitHub user is authorized to post
 */
export async function isAuthorizedPoster(githubLogin: string): Promise<boolean> {
  if (!githubLogin) return false;

  // Special case for blog owner - always authorized
  if (isOwner(githubLogin)) return true;

  try {
    const poster = await prisma.authorizedPoster.findUnique({
      where: { githubLogin },
      select: { id: true },
    });
    return poster !== null;
  } catch (error) {
    console.error('Error checking authorized poster status:', error);
    return false;
  }
}

/**
 * Add a GitHub user to the authorized posters list
 */
export async function addAuthorizedPoster(
  githubLogin: string,
  options?: {
    isPermanent?: boolean;
    permissionLevel?: 'CONTRIBUTOR' | 'EDITOR' | 'ADMIN';
    canPublish?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    authorizedBy?: string;
  }
): Promise<AuthorizedPoster | null> {
  if (!githubLogin) return null;

  try {
    return await prisma.authorizedPoster.upsert({
      where: { githubLogin },
      create: {
        githubLogin,
        isPermanent: options?.isPermanent ?? false,
        permissionLevel: options?.permissionLevel ?? 'CONTRIBUTOR',
        canPublish: options?.canPublish ?? true,
        canEdit: options?.canEdit ?? true,
        canDelete: options?.canDelete ?? false,
        authorizedBy: options?.authorizedBy ?? 'system',
        lastAuthorizedAt: new Date(),
      },
      update: {
        // If already exists, just update lastAuthorizedAt
        lastAuthorizedAt: new Date(),
        authorizedBy: options?.authorizedBy,
      },
    });
  } catch (error) {
    console.error('Error adding authorized poster:', error);
    return null;
  }
}

/**
 * Remove a GitHub user from the authorized posters list
 */
export async function removeAuthorizedPoster(githubLogin: string): Promise<boolean> {
  if (!githubLogin) return false;

  // Never remove the blog owner
  if (isOwner(githubLogin)) return false;

  try {
    await prisma.authorizedPoster.delete({
      where: { githubLogin },
    });
    return true;
  } catch (error) {
    // P2025 = record not found
    if ((error as { code?: string }).code !== 'P2025') {
      console.error('Error removing authorized poster:', error);
    }
    return false;
  }
}

/**
 * Get all authorized posters
 */
export async function getAllAuthorizedPosters(): Promise<AuthorizedPoster[]> {
  try {
    return await prisma.authorizedPoster.findMany({
      orderBy: { githubLogin: 'asc' },
    });
  } catch (error) {
    console.error('Error getting authorized posters:', error);
    return [];
  }
}

/**
 * Update an authorized poster's permissions
 */
export async function updateAuthorizedPoster(
  githubLogin: string,
  updates: {
    isPermanent?: boolean;
    permissionLevel?: 'CONTRIBUTOR' | 'EDITOR' | 'ADMIN';
    canPublish?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    authorizedBy?: string;
  }
): Promise<AuthorizedPoster | null> {
  if (!githubLogin) return null;

  try {
    return await prisma.authorizedPoster.update({
      where: { githubLogin },
      data: {
        ...updates,
        lastAuthorizedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating authorized poster:', error);
    return null;
  }
}

/**
 * Check if a GitHub user has specific permissions
 */
export async function hasPermission(
  githubLogin: string,
  permission: 'publish' | 'edit' | 'delete' | 'admin'
): Promise<boolean> {
  if (!githubLogin) return false;

  // Special case for blog owner - always grant all permissions
  if (isOwner(githubLogin)) return true;

  try {
    const poster = await prisma.authorizedPoster.findUnique({
      where: { githubLogin },
      select: {
        canPublish: true,
        canEdit: true,
        canDelete: true,
        permissionLevel: true,
      },
    });

    if (!poster) return false;

    switch (permission) {
      case 'publish':
        return poster.canPublish;
      case 'edit':
        return poster.canEdit;
      case 'delete':
        return poster.canDelete;
      case 'admin':
        return poster.permissionLevel === 'ADMIN';
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
 */
export async function grantPermanentAccess(
  githubLogin: string,
  grantedBy?: string
): Promise<AuthorizedPoster | null> {
  if (!githubLogin) return null;

  try {
    return await prisma.authorizedPoster.upsert({
      where: { githubLogin },
      create: {
        githubLogin,
        isPermanent: true,
        permissionLevel: 'EDITOR',
        canPublish: true,
        canEdit: true,
        canDelete: false,
        authorizedBy: grantedBy ?? 'system',
        lastAuthorizedAt: new Date(),
      },
      update: {
        isPermanent: true,
        permissionLevel: 'EDITOR',
        canPublish: true,
        canEdit: true,
        lastAuthorizedAt: new Date(),
        authorizedBy: grantedBy,
      },
    });
  } catch (error) {
    console.error('Error granting permanent access:', error);
    return null;
  }
}
