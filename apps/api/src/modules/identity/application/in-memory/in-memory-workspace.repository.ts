import { Workspace } from '../../domain/entities/workspace.entity';
import type { IWorkspaceRepository } from '../../domain/repositories/iworkspace.repository';

export class InMemoryWorkspaceRepository implements IWorkspaceRepository {
  private store = new Map<string, Workspace>();

  async findById(id: string): Promise<Workspace | null>  { return this.store.get(id) ?? null; }

  async findBySlug(slug: string): Promise<Workspace | null> {
    for (const ws of this.store.values()) {
      if (ws.slug.value === slug) return ws;
    }
    return null;
  }

  async findByUserId(userId: string): Promise<Workspace[]> {
    return [...this.store.values()].filter(ws => ws.hasMember(userId));
  }

  async save(workspace: Workspace): Promise<void> { this.store.set(workspace.id, workspace); }
  async delete(id: string): Promise<void>         { this.store.delete(id); }

  seed(ws: Workspace): Workspace { this.store.set(ws.id, ws); return ws; }
  clear(): void { this.store.clear(); }
}
