import { remark } from 'remark';
import html from 'remark-html';
import prisma from '@/lib/prisma';
import { Post as PrismaPost, Tag, User } from '@prisma/client';
import { cache } from 'react';
import { getImageUrl, isValidImageData } from '@/lib/uploadthing-utils';

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  coverImage: string;
  tags: string[];
  author?: {
    id: string;
    name: string;
    image: string;
  };
}

// Helper function to convert Prisma Post to our Post interface
function convertPrismaPostToPost(
  post: PrismaPost & {
    tags?: Tag[];
    author?: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }
): Post {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    content: post.content,
    date: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    coverImage: post.coverImage || '',
    tags: post.tags ? post.tags.map(tag => tag.name) : [],
    author: post.author ? {
      id: post.author.id,
      name: post.author.name || '',
      image: post.author.image || '',
    } : undefined
  };
}

// Get all post slugs for static generation
export async function getAllPostSlugs() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });
  
  return posts.map(post => ({
    params: {
      slug: post.slug,
    },
  }));
}

// Get a post by slug
export const getPostBySlug = cache(async (slug: string): Promise<Post | undefined> => {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      tags: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
  
  if (!post) {
    return undefined;
  }
  
  return convertPrismaPostToPost(post);
});

// Convert markdown content to HTML
export async function getPostContentHtml(content: string): Promise<string> {
  try {
    // Convert markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(content);

    let htmlContent = processedContent.toString();
    
    // Process image URLs in the HTML content
    // This regex matches <img> tags with src attributes
    const imgRegex = /<img([^>]*)src=["']([^"']*)["']([^>]*)>/g;

    // Replace image URLs with the proper UploadThing URLs
    htmlContent = htmlContent.replace(imgRegex, (match, before, src, after) => {
      try {
        // Skip processing if src is empty
        if (!src) return match;

        // Only process JSON metadata strings
        if (src.startsWith('{')) {
          const processedSrc = getImageUrl(src);
          return `<img${before}src="${processedSrc}"${after}>`;
        }

        // Return unchanged for other sources
        return match;
      } catch (error) {
        console.error('Error processing image in HTML content:', error);
        return match; // Return original on error
      }
    });

    return htmlContent;
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    // Return the original content as a fallback
    return `<div>${content}</div>`;
  }
}

// Get all posts with pagination and sorting
export const getAllPosts = cache(async ({
  page = 1,
  limit = 10,
  orderBy = 'createdAt',
  orderDirection = 'desc',
  tag = null,
  search = null,
}: {
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'publishedAt' | 'title';
  orderDirection?: 'asc' | 'desc';
  tag?: string | null;
  search?: string | null;
} = {}): Promise<{ posts: Post[]; total: number; totalPages: number }> => {
  // Build the where clause
  const where: any = { published: true };
  
  // Filter by tag if provided
  if (tag) {
    where.tags = {
      some: {
        name: tag,
      },
    };
  }

  // Search in title or content if provided
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get total count for pagination
  const total = await prisma.post.count({ where });
  const totalPages = Math.ceil(total / limit);

  // Get posts with pagination and sorting
  const posts = await prisma.post.findMany({
    where,
    include: {
      tags: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      [orderBy]: orderDirection,
    },
    skip: (page - 1) * limit,
    take: limit,
  });
  
  return {
    posts: posts.map(convertPrismaPostToPost),
    total,
    totalPages,
  };
});

// Get recent posts
export const getRecentPosts = cache(async (count: number = 3): Promise<Post[]> => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: {
      tags: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: count,
  });

  return posts.map(convertPrismaPostToPost);
});

// Get posts by tag
export const getPostsByTag = cache(async (tag: string): Promise<Post[]> => {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      tags: {
        some: {
          name: tag,
        },
      },
    },
    include: {
      tags: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return posts.map(convertPrismaPostToPost);
});

// Get all tags with post count
export const getAllTags = cache(async (): Promise<{ name: string; count: number }[]> => {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: { published: true },
          },
        },
      },
    },
  });

  return tags
    .map(tag => ({
      name: tag.name,
      count: tag._count.posts,
    }))
    .filter(tag => tag.count > 0)
    .sort((a, b) => b.count - a.count);
});