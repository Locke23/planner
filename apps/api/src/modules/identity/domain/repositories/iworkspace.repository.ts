import type { Workspace } from '../entities/workspace.entity';

export interface IWorkspaceRepository {
  findById(id: string): Promise<Workspace | null>;
  findBySlug(slug: string): Promise<Workspace | null>;
  findByUserId(userId: string): Promise<Workspace[]>;
  save(workspace: Workspace): Promise<void>;
  delete(id: string): Promise<void>;
}

export const WORKSPACE_REPOSITORY = Symbol('IWorkspaceRepository');
