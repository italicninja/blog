import { remark } from 'remark';
import html from 'remark-html';
import rehypeParse from 'rehype-parse';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import prisma from '@/lib/prisma';
import { Post as PrismaPost, Tag, PostStatus } from '@prisma/client';
import { cache } from 'react';
import { getImageUrl, isValidImageData, DEFAULT_FALLBACK_IMAGE } from '@/lib/uploadthing-utils';

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  coverImage: string;
  tags: string[];
  editedAt?: string;
  author?: {
    id: string;
    name: string;
    image: string;
    githubLogin?: string;
  };
}

// Shared include block for post queries
const POST_INCLUDE = {
  tags: true,
  author: {
    select: {
      id: true,
      name: true,
      image: true,
      githubLogin: true,
    },
  },
} as const;

// Shared where clause for published posts (not soft-deleted)
function publishedWhere(): { status: PostStatus; isDeleted: boolean } {
  return { status: PostStatus.PUBLISHED, isDeleted: false };
}

// Helper function to convert Prisma Post to our Post interface
function convertPrismaPostToPost(
  post: PrismaPost & {
    tags?: Tag[];
    author?: {
      id: string;
      name: string | null;
      image: string | null;
      githubLogin?: string | null;
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
    editedAt: post.editedAt?.toISOString(),
    author: post.author ? {
      id: post.author.id,
      name: post.author.name || '',
      image: post.author.image || '',
      githubLogin: post.author.githubLogin || undefined,
    } : undefined
  };
}

// Get all post slugs for static generation
export async function getAllPostSlugs() {
  const posts = await prisma.post.findMany({
    where: publishedWhere(),
    select: { slug: true },
  });

  return posts.map(post => ({
    slug: post.slug,
  }));
}

// Get a post by slug
export const getPostBySlug = cache(async (slug: string): Promise<Post | undefined> => {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: POST_INCLUDE,
  });
  
  if (!post) {
    return undefined;
  }
  
  // Only return published, non-deleted posts via this public accessor
  if (post.status !== PostStatus.PUBLISHED || post.isDeleted) {
    return undefined;
  }

  return convertPrismaPostToPost(post);
});

// Sanitize HTML output using rehype-sanitize (proper allowlist-based sanitizer)
async function sanitizeHtml(htmlContent: string): Promise<string> {
  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(htmlContent);
  return String(file);
}

// Convert markdown content to HTML
export async function getPostContentHtml(content: string): Promise<string> {
  // Convert markdown to HTML
  const processedContent = await remark()
    .use(html, { sanitize: false }) // We apply rehype-sanitize after
    .process(content);

  let htmlContent = processedContent.toString();
  
  // Process image URLs in the HTML content
  const imgRegex = /<img([^>]*)src=["']([^"']*)["']([^>]*)>/g;

  htmlContent = htmlContent.replace(imgRegex, (match, before, src, after) => {
    try {
      if (!src) return match;

      let processedSrc: string;

      if (src.startsWith('{')) {
        processedSrc = getImageUrl(src);
      } else if (src.startsWith('/')) {
        console.warn('Local file path detected in content, using fallback image:', src);
        processedSrc = DEFAULT_FALLBACK_IMAGE;
      } else {
        // Direct URL (UploadThing or otherwise) — use as is
        processedSrc = src;
      }

      return `<img${before}src="${processedSrc}"${after}>`;
    } catch (error) {
      console.error('Error processing image in HTML content:', error, 'Source:', src);
      return `<img${before}src="${DEFAULT_FALLBACK_IMAGE}"${after}>`;
    }
  });

  // Apply proper allowlist-based HTML sanitization
  return sanitizeHtml(htmlContent);
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
  const where: import('@prisma/client').Prisma.PostWhereInput = {
    ...publishedWhere(),
    ...(tag ? { tags: { some: { name: tag } } } : {}),
    ...(search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    } : {}),
  };

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      include: POST_INCLUDE,
      orderBy: { [orderBy]: orderDirection },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    posts: posts.map(convertPrismaPostToPost),
    total,
    totalPages: Math.ceil(total / limit),
  };
});

// Get recent posts
export const getRecentPosts = cache(async (count: number = 3): Promise<Post[]> => {
  const posts = await prisma.post.findMany({
    where: publishedWhere(),
    include: POST_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: count,
  });

  return posts.map(convertPrismaPostToPost);
});

// Get all cover images from published posts for hero banner (limited to 20)
export const getCoverImages = cache(async (): Promise<string[]> => {
  const posts = await prisma.post.findMany({
    where: publishedWhere(),
    select: { coverImage: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return posts
    .map(post => post.coverImage)
    .filter((image): image is string => {
      if (!image || image.trim().length === 0) return false;
      if (image.startsWith('http://') || image.startsWith('https://')) return true;
      if (isValidImageData(image)) return true;
      return false;
    })
    .map(image => getImageUrl(image))
    .filter((url): url is string => {
      return !!url &&
             url.length > 0 &&
             !url.includes('/images/posts/') &&
             (url.startsWith('http://') || url.startsWith('https://'));
    });
});

// Get posts by tag
export const getPostsByTag = cache(async (tag: string): Promise<Post[]> => {
  const posts = await prisma.post.findMany({
    where: {
      ...publishedWhere(),
      tags: { some: { name: tag } },
    },
    include: POST_INCLUDE,
    orderBy: { createdAt: 'desc' },
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
            where: { status: PostStatus.PUBLISHED, isDeleted: false },
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
