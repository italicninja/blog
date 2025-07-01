import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { Session } from 'next-auth';
import { pinnedProjectRepository } from '@/repositories/pinned-project.repository';
import { z } from 'zod';

const pinnedProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  url: z.string().url('Invalid URL'),
  description: z.string().max(500, 'Description must be less than 500 characters'),
  completedAt: z.string().datetime(),
  tags: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pinnedProjects = await pinnedProjectRepository.findByUserId(session.user.id);
  return NextResponse.json(pinnedProjects);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validationResult = pinnedProjectSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
  }

  const { data } = validationResult;
  const pinnedProject = await pinnedProjectRepository.create({
    ...data,
    userId: session.user.id,
    completedAt: new Date(data.completedAt),
  });

  return NextResponse.json(pinnedProject, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updateData } = body;

  if (!id) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  const validationResult = pinnedProjectSchema.partial().safeParse(updateData);

  if (!validationResult.success) {
    return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
  }

  const { data } = validationResult;
  const existingProject = await pinnedProjectRepository.findById(id);

  if (!existingProject || existingProject.userId !== session.user.id) {
    return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
  }

  const updatedProject = await pinnedProjectRepository.update(id, {
    ...data,
    completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
  });

  return NextResponse.json(updatedProject);
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  const existingProject = await pinnedProjectRepository.findById(id);

  if (!existingProject || existingProject.userId !== session.user.id) {
    return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
  }

  await pinnedProjectRepository.delete(id);
  return NextResponse.json({ message: 'Project deleted successfully' });
}