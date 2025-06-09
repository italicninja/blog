import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import {
  isAuthorizedPoster,
  addAuthorizedPoster,
  removeAuthorizedPoster,
  getAllAuthorizedPosters
} from '@/lib/authorized-posters';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper function to check if the current user is an admin
async function isAdmin(githubLogin: string): Promise<boolean> {
  if (!githubLogin) return false;
  
  // Special case for italicninja - always grant admin access
  if (githubLogin === 'italicninja') return true;

  try {
    // First check if the user is authorized
    const isAuthorized = await isAuthorizedPoster(githubLogin);
    if (!isAuthorized) return false;

    // Check if the user has admin permission level
    const poster = await prisma.$queryRaw`
      SELECT * FROM "AuthorizedPoster" WHERE "githubLogin" = ${githubLogin}
    `;

    if (Array.isArray(poster) && poster.length > 0) {
      return poster[0].permissionLevel === 'admin';
    }

    // Fallback to the original logic for backward compatibility
    const authorizedPosters = await getAllAuthorizedPosters();

    // If there are no authorized posters or this is the first one, they're an admin
    if (!Array.isArray(authorizedPosters) || authorizedPosters.length === 0) return true;

    // For simplicity, the first authorized poster is considered an admin
    return authorizedPosters[0]?.githubLogin === githubLogin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the GitHub login from the session
    const githubLogin = session.user.name || '';
    
    // Check if the user is an admin
    if (!githubLogin || !(await isAdmin(githubLogin))) {
      return NextResponse.json(
        { error: 'You are not authorized to view authorized posters' },
        { status: 403 }
      );
    }
    
    // Get all authorized posters
    const authorizedPosters = await getAllAuthorizedPosters();
    
    return NextResponse.json(authorizedPosters);
  } catch (error) {
    console.error('Error fetching authorized posters:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching authorized posters' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the GitHub login from the session
    const currentUserLogin = session.user.name || '';
    
    // Check if the user is an admin
    if (!currentUserLogin || !(await isAdmin(currentUserLogin))) {
      return NextResponse.json(
        { error: 'You are not authorized to add authorized posters' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    const { githubLogin } = body;
    
    if (!githubLogin) {
      return NextResponse.json(
        { error: 'GitHub login is required' },
        { status: 400 }
      );
    }
    
    // Add the authorized poster with specified permissions
    const authorizedPoster = await addAuthorizedPoster(githubLogin, {
      isPermanent: body.isPermanent || false,
      permissionLevel: body.permissionLevel || 'contributor',
      canPublish: body.canPublish !== false, // Default to true
      canEdit: body.canEdit !== false, // Default to true
      canDelete: body.canDelete || false,
      authorizedBy: currentUserLogin
    });
    
    if (!authorizedPoster) {
      return NextResponse.json(
        { error: 'Failed to add authorized poster' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(authorizedPoster, { status: 201 });
  } catch (error) {
    console.error('Error adding authorized poster:', error);
    return NextResponse.json(
      { error: 'An error occurred while adding authorized poster' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the GitHub login from the session
    const currentUserLogin = session.user.name || '';
    
    // Check if the user is an admin
    if (!currentUserLogin || !(await isAdmin(currentUserLogin))) {
      return NextResponse.json(
        { error: 'You are not authorized to remove authorized posters' },
        { status: 403 }
      );
    }
    
    // Get the GitHub login from the query parameters
    const { searchParams } = new URL(request.url);
    const githubLogin = searchParams.get('githubLogin');
    
    if (!githubLogin) {
      return NextResponse.json(
        { error: 'GitHub login is required' },
        { status: 400 }
      );
    }
    
    // Don't allow removing yourself
    if (githubLogin === currentUserLogin) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from authorized posters' },
        { status: 400 }
      );
    }
    
    // Remove the authorized poster
    const success = await removeAuthorizedPoster(githubLogin);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove authorized poster' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing authorized poster:', error);
    return NextResponse.json(
      { error: 'An error occurred while removing authorized poster' },
      { status: 500 }
    );
  }
}