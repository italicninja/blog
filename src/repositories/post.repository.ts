import { Post, PrismaClient, Prisma } from '@prisma/client';
import { PrismaRepository } from './base.repository';
import { PostSearchCriteria, PaginatedResult, CreatePostDTO, UpdatePostDTO } from './types';

export class PostRepository extends PrismaRepository<Post, Prisma.PostCreateInput, Prisma.PostUpdateInput> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
      include: { tags: true, author: true },
    });
  }

  async create(data: CreatePostDTO): Promise<Post> {
    return this.prisma.post.create({
      data,
      include: { tags: true, author: true },
    });
  }

  async update(id: string, data: UpdatePostDTO): Promise<Post> {
    return this.prisma.post.update({
      where: { id },
      data,
      include: { tags: true, author: true },
    });
  }

  async delete(id: string): Promise<void> {
    const updateData = {
      isDeleted: true,
      deletedAt: new Date(),
    } as unknown as Prisma.PostUpdateInput;

    await this.prisma.post.update({
      where: { id },
      data: updateData,
    });
  }

  async findPublished(criteria: PostSearchCriteria): Promise<PaginatedResult<Post>> {
    const { page = 1, limit = 10, status, tag, search, authorId, isDeleted, sort } = criteria;
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: any = {};

    // Handle both old and new schema for published/status
    try {
      if (status) {
        where.status = status;
      } else {
        where.published = true;
      }
    } catch (error) {
      // If status field doesn't exist, fallback to published
      where.published = true;
    }

    // Add isDeleted condition if the field exists
    if (isDeleted !== undefined) {
      where.isDeleted = isDeleted;
    }

    // Add tag condition
    if (tag) {
      where.tags = { some: { name: tag } };
    }

    // Add author condition
    if (authorId) {
      where.authorId = authorId;
    }

    // Add search condition
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: { tags: true, author: true },
        skip,
        take: limit,
        orderBy: sort ? { [sort.field]: sort.direction } : { publishedAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      items: posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
    };
  }

  async incrementVersion(id: string): Promise<Post> {
    // Handle version increment based on schema
    try {
      return await this.prisma.post.update({
        where: { id },
        data: {
          version: { increment: 1 }
        } as Prisma.PostUpdateInput
      });
    } catch (error) {
      // If version field doesn't exist, just return the post
      const post = await this.prisma.post.findUnique({
        where: { id }
      });
      if (!post) {
        throw new Error(`Post with id ${id} not found`);
      }
      return post;
    }
  }

  async findBySlug(slug: string): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { slug },
      include: { tags: true, author: true },
    });
  }
}