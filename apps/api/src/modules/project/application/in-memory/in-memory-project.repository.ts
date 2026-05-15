import { Project } from '../../domain/entities/project.entity';
import type { IProjectRepository, ProjectView } from '../../domain/repositories/iproject.repository';

export class InMemoryProjectRepository implements IProjectRepository {
  private store = new Map<string, Project>();

  async findById(id: string): Promise<Project | null> {
    return this.store.get(id) ?? null;
  }

  async findViewById(id: string, workspaceId: string): Promise<ProjectView | null> {
    const p = this.store.get(id);
    if (!p || p.workspaceId !== workspaceId) return null;
    return this.toView(p);
  }

  async findByWorkspace(workspaceId: string): Promise<ProjectView[]> {
    return [...this.store.values()]
      .filter(p => p.workspaceId === workspaceId)
      .map(p => this.toView(p));
  }

  async findByIdentifier(workspaceId: string, identifier: string): Promise<Project | null> {
    for (const p of this.store.values()) {
      if (p.workspaceId === workspaceId && p.identifier === identifier) return p;
    }
    return null;
  }

  async save(project: Project): Promise<void> { this.store.set(project.id, project); }
  async delete(id: string): Promise<void>     { this.store.delete(id); }

  seed(p: Project): Project { this.store.set(p.id, p); return p; }
  clear(): void { this.store.clear(); }

  private toView(p: Project): ProjectView {
    return {
      id: p.id,
      workspaceId: p.workspaceId,
      name: p.name,
      description: p.description,
      identifier: p.identifier,
      statuses: [],
      labels: [],
      issueCount: 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
