import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { isAuthorizedPoster, hasPermission } from '@/lib/authorized-posters';
import prisma from '@/lib/prisma';
import { Prisma, Post } from '@prisma/client';
import slugify from 'slugify';
import { authOptions } from '@/lib/auth-options';
import { z } from 'zod';
import { getGithubLogin, isOwner } from '@/lib/auth-utils';

type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

// Validation schema for post creation
const PostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
  coverImage: z.string().url('Cover image must be a valid URL').optional().or(z.literal('')),
  tags: z.array(z.string().max(30, 'Tags must be less than 30 characters')).max(10, 'Maximum of 10 tags allowed'),
});

/**
 * Sanitize content to remove potentially dangerous HTML/scripts
 * This is a server-side defense-in-depth measure
 */
function sanitizeContent(content: string): string {
  // Remove dangerous tags and attributes
  // Note: Content is Markdown, so we're being aggressive here
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:text\/html/gi, ''); // Remove data URIs
}

// Helper function to generate a unique slug
async function generateUniqueSlug(title: string): Promise<string> {
  // Create a base slug from the title
  let slug = slugify(title, { lower: true, strict: true });
  
  // Check if the slug already exists
  const existingPost = await prisma.post.findUnique({
    where: { slug },
  });
  
  // If the slug exists, append a random string
  if (existingPost) {
    const randomString = Math.random().toString(36).substring(2, 8);
    slug = `${slug}-${randomString}`;
  }
  
  return slug;
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
    const githubLogin = getGithubLogin(session.user);

    // Special case for blog owner - always authorized
    if (isOwner(githubLogin)) {
      // Continue with the request - blog owner is always authorized
    } else {
      // Check if the user is authorized to post and has publishing permission
      const isAuthorized = await isAuthorizedPoster(githubLogin);

      // First check basic authorization
      if (!githubLogin || !isAuthorized) {
      return NextResponse.json(
        { error: 'You are not authorized to create posts' },
        { status: 403 }
        );
      }

      // Then check if they have publishing permission
      // Note: hasPermission might not be available yet due to Prisma client issues,
      // so we'll use a try-catch and fall back to basic authorization
      try {
        const canPublish = await hasPermission(githubLogin, 'publish');
        if (!canPublish) {
          return NextResponse.json(
            { error: 'You do not have permission to publish posts' },
            { status: 403 }
          );
        }
      } catch (error) {
        console.warn('Error checking publish permission, falling back to basic authorization:', error);
        // We already checked basic authorization above, so we can continue
      }
    }

    // Parse and validate the request body
    const body = await request.json();
    
    // Validate with Zod schema
    const validationResult = PostSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((err: any) =>
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');

      return NextResponse.json(
        { error: `Validation failed: ${errorMessages}` },
        { status: 400 }
      );
    }
    
    const { title, content, excerpt, coverImage, tags } = validationResult.data;

    // Sanitize content and excerpt to prevent XSS attacks
    const sanitizedContent = sanitizeContent(content);
    const sanitizedExcerpt = excerpt ? sanitizeContent(excerpt) : null;
    const sanitizedTitle = sanitizeContent(title);

    // Generate a unique slug for the post
    const slug = await generateUniqueSlug(sanitizedTitle);
    
    // Find or create the user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { githubLogin },
          { name: githubLogin }
        ]
      }
    });

    // If user doesn't exist, create a new one
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: githubLogin,
          githubLogin,
        }
      });
    }

    // Process tags - find or create them
    const tagObjects = [];
    for (const tagName of tags) {
      const trimmedName = tagName.trim();
      if (!trimmedName) continue;

      const tag = await prisma.tag.upsert({
        where: { name: trimmedName },
        update: {},
        create: { name: trimmedName }
      });

      tagObjects.push(tag);
    }
    
    // Create the post with proper relations
    const postData = {
      title: sanitizedTitle,
      slug,
      content: sanitizedContent,
      excerpt: sanitizedExcerpt,
      coverImage: coverImage || null,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      author: {
        connect: { id: user.id }
      },
      tags: {
        connect: tagObjects.map(tag => ({ id: tag.id }))
      }
    } as const;

    const createdPost = await prisma.post.create({
      data: postData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        tags: true
      }
    });

    return NextResponse.json(createdPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the post' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const orderDirection = searchParams.get('orderDirection') || 'desc';
    
    // Validate and sanitize parameters
    const validOrderByFields = ['createdAt', 'publishedAt', 'title'];
    const validOrderDirections = ['asc', 'desc'];

    const sanitizedOrderBy = validOrderByFields.includes(orderBy) ? orderBy : 'createdAt';
    const sanitizedOrderDirection = validOrderDirections.includes(orderDirection as any) ? orderDirection as 'asc' | 'desc' : 'desc';

    // Build the where clause
    const whereConditions: Prisma.PostWhereInput[] = [];

    // Published status filter
    if (published === 'true') {
      whereConditions.push({ status: 'PUBLISHED' } as Prisma.PostWhereInput);
    } else if (published === 'false') {
      whereConditions.push({ status: 'DRAFT' } as Prisma.PostWhereInput);
    }

    // Tag filter
    if (tag) {
      whereConditions.push({
        tags: {
          some: {
            name: tag,
          },
        },
      });
    }

    // Search filter
    if (search) {
      whereConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.PostWhereInput = whereConditions.length > 0 ? { AND: whereConditions } : {};

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.post.count({ where });
    const totalPages = Math.ceil(total / limit);

    // Get the posts with pagination and sorting
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: true,
      },
      orderBy: {
        [sanitizedOrderBy]: sanitizedOrderDirection,
      },
      skip,
      take: limit,
    });
    
    // Return posts with pagination metadata
    return NextResponse.json({
      posts,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching posts' },
      { status: 500 }
    );
  }
}

// Add a DELETE endpoint to delete posts
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
    const githubLogin = getGithubLogin(session.user);

    // Special case for blog owner - always authorized
    if (!isOwner(githubLogin)) {
      // Check if the user has delete permission
      try {
        const canDelete = await hasPermission(githubLogin, 'delete');
        if (!canDelete) {
          return NextResponse.json(
            { error: 'You do not have permission to delete posts' },
            { status: 403 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Error checking delete permission' },
          { status: 500 }
        );
      }
    }

    // Get the post ID from the request
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Delete the post
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the post' },
      { status: 500 }
    );
  }
}

// Add a PATCH endpoint to update posts
export async function PATCH(request: NextRequest) {
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
    const githubLogin = getGithubLogin(session.user);

    // Parse the request body
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Get the post to check ownership
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if the user is the author or has edit permission
    const isAuthor = post.author.githubLogin === githubLogin || post.author.name === githubLogin;

    if (!isAuthor && !isOwner(githubLogin)) {
      try {
        const canEdit = await hasPermission(githubLogin, 'edit');
        if (!canEdit) {
          return NextResponse.json(
            { error: 'You do not have permission to edit this post' },
            { status: 403 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Error checking edit permission' },
          { status: 500 }
        );
      }
    }

    // Process tags if provided
    let tagConnections;
    if (updateData.tags && Array.isArray(updateData.tags)) {
      const tagObjects = [];
      for (const tagName of updateData.tags) {
        const trimmedName = tagName.trim();
        if (!trimmedName) continue;

        const tag = await prisma.tag.upsert({
          where: { name: trimmedName },
          update: {},
          create: { name: trimmedName }
        });

        tagObjects.push(tag);
      }

      // Set up tag connections
      tagConnections = {
        set: [], // Clear existing connections
        connect: tagObjects.map(tag => ({ id: tag.id }))
      };

      // Remove tags from updateData as we'll handle them separately
      delete updateData.tags;
    }
    
    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...updateData,
        ...(tagConnections ? { tags: tagConnections } : {}),
        updatedAt: new Date(),
        editedAt: new Date(), // Set the edited timestamp
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        tags: true
      }
    });
    
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the post' },
      { status: 500 }
    );
  }
}