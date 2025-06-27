import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  try {
    const tags = await prisma.tag.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
      take: 10,
      select: {
        id: true,
        name: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    const formattedTags = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      count: tag._count.posts,
    }));

    return NextResponse.json({ tags: formattedTags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}