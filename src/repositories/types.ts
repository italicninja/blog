import { Post, Tag, User, AuthorizedPoster, Prisma } from '@prisma/client';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PostSearchCriteria extends PaginationParams {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tag?: string;
  search?: string;
  authorId?: string;
  isDeleted?: boolean;
  sort?: SortParams;
}

export interface CreatePostDTO extends Prisma.PostCreateInput {}

export interface UpdatePostDTO extends Prisma.PostUpdateInput {}

export interface AuthorizedPosterSearchCriteria extends PaginationParams {
  permissionLevel?: 'CONTRIBUTOR' | 'EDITOR' | 'ADMIN';
  isPermanent?: boolean;
  sort?: SortParams;
}

export interface CreateAuthorizedPosterDTO extends Prisma.AuthorizedPosterCreateInput {}

export interface UpdateAuthorizedPosterDTO extends Prisma.AuthorizedPosterUpdateInput {}

export interface BaseRepository<T, CreateInput, UpdateInput> {
  findById(id: string): Promise<T | null>;
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T>;
  delete(id: string): Promise<void>;
}