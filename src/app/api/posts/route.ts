import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { isAuthorizedPoster, hasPermission } from '@/lib/authorized-posters';
import prisma from '@/lib/prisma';
import slugify from 'slugify';
import { authOptions } from '@/lib/auth-options';

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
    const githubLogin = session.user.githubLogin || session.user.name || '';
    
    // Special case for italicninja - always authorized
    if (githubLogin === 'italicninja') {
      // Continue with the request - italicninja is always authorized
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

    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    const { title, content, excerpt, coverImage, tags } = body;
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Generate a unique slug for the post
    const slug = await generateUniqueSlug(title);
    
    // Find the user record using a raw query to bypass TypeScript errors
    const users = await prisma.$queryRaw<any[]>`
      SELECT * FROM "User" WHERE "githubLogin" = ${githubLogin} OR "name" = ${githubLogin} LIMIT 1
    `;
    
    let user: any = users.length > 0 ? users[0] : null;

    // If user doesn't exist, create a new one
    if (!user) {
      const newUsers = await prisma.$queryRaw<any[]>`
        INSERT INTO "User" ("id", "name", "githubLogin", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${githubLogin}, ${githubLogin}, NOW(), NOW())
        RETURNING *
      `;

      user = newUsers.length > 0 ? newUsers[0] : null;

      if (!user) {
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }
    }
    
    // Process tags
    const processedTags: any[] = [];
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        const trimmedName = tagName.trim();
        // Find or create the tag using raw queries
        const existingTags = await prisma.$queryRaw<any[]>`
          SELECT * FROM "Tag" WHERE "name" = ${trimmedName} LIMIT 1
        `;
        
        let tag: any;
        if (existingTags.length === 0) {
          const newTags = await prisma.$queryRaw<any[]>`
            INSERT INTO "Tag" ("id", "name")
            VALUES (gen_random_uuid(), ${trimmedName})
            RETURNING *
          `;
          tag = newTags.length > 0 ? newTags[0] : null;
        } else {
          tag = existingTags[0];
        }

        if (tag) {
          processedTags.push(tag);
        }
      }
    }
    
    // Create the post using raw query
    const newPosts = await prisma.$queryRaw<any[]>`
      INSERT INTO "Post" (
        "id", "title", "slug", "content", "excerpt", "coverImage",
        "published", "createdAt", "updatedAt", "publishedAt", "authorId"
      ) VALUES (
        gen_random_uuid(), ${title}, ${slug}, ${content}, ${excerpt || ''}, ${coverImage || ''},
        true, NOW(), NOW(), NOW(), ${user.id}
      )
      RETURNING *
    `;

    const post = newPosts.length > 0 ? newPosts[0] : null;

    if (!post) {
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    // Connect tags to post
    for (const tag of processedTags) {
      await prisma.$executeRaw`
        INSERT INTO "_PostToTag" ("A", "B")
        VALUES (${post.id}, ${tag.id})
      `;
    }

    // Fetch the complete post with relations
    const completePost = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        author: true,
        tags: true,
      },
    });
    
    return NextResponse.json(completePost, { status: 201 });
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
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    // Build the query
    const query: any = {
      where: {},
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
        createdAt: 'desc',
      },
      take: limit,
    };
    
    // Filter by published status
    if (published === 'true') {
      query.where.published = true;
    } else if (published === 'false') {
      query.where.published = false;
    }
    
    // Filter by tag
    if (tag) {
      query.where.tags = {
        some: {
          name: tag,
        },
      };
    }
    
    // Get the posts
    const posts = await prisma.post.findMany(query);
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching posts' },
      { status: 500 }
    );
  }
}