import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { PinnedProject, CreatePinnedProjectInput, UpdatePinnedProjectInput } from '@/types/pinned-project';

interface CreatePinnedProjectData extends Omit<CreatePinnedProjectInput, 'completedAt'> {
  userId: string;
  completedAt: Date;
}

interface UpdatePinnedProjectData extends Omit<UpdatePinnedProjectInput, 'completedAt'> {
  completedAt?: Date;
}

export class PinnedProjectRepository {
  async create(data: CreatePinnedProjectData): Promise<PinnedProject> {
    const { tags = [], ...projectData } = data;

    return prisma.pinnedProject.create({
      data: {
        ...projectData,
        tags: {
          connect: tags.map(name => ({ name }))
        }
      },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
  }

  async update(id: string, data: UpdatePinnedProjectData): Promise<PinnedProject> {
    const { tags, ...updateData } = data;

    return prisma.pinnedProject.update({
      where: { id },
      data: {
        ...updateData,
        ...(tags && {
          tags: {
            set: [],
            connect: tags.map(name => ({ name }))
          }
        })
      },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.pinnedProject.delete({
      where: { id }
    });
  }

  async findById(id: string): Promise<PinnedProject | null> {
    return prisma.pinnedProject.findUnique({
      where: { id },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
  }

  async findByUserId(userId: string): Promise<PinnedProject[]> {
    return prisma.pinnedProject.findMany({
      where: { userId },
      orderBy: [
        { sortOrder: 'asc' },
        { completedAt: 'desc' }
      ],
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
  }

  async updateOrder(id: string, newOrder: number): Promise<void> {
    await prisma.pinnedProject.update({
      where: { id },
      data: { sortOrder: newOrder }
    });
  }
}

export const pinnedProjectRepository = new PinnedProjectRepository();