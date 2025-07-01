export interface PinnedProject {
  id: string;
  name: string;
  url: string;
  description: string;
  completedAt: string | Date;
  sortOrder: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  userId: string;
  tags: Tag[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface CreatePinnedProjectInput {
  name: string;
  url: string;
  description: string;
  completedAt: string;
  tags?: string[];
}

export interface UpdatePinnedProjectInput extends Partial<CreatePinnedProjectInput> {
  sortOrder?: number;
}