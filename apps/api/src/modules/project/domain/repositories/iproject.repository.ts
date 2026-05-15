import type { Project } from '../entities/project.entity';

export interface StatusView {
  id: string;
  projectId: string;
  name: string;
  color: string;
  type: string;
  position: number;
}

export interface LabelView {
  id: string;
  projectId: string;
  name: string;
  color: string;
}

export interface ProjectView {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  identifier: string;
  statuses: StatusView[];
  labels: LabelView[];
  issueCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findViewById(id: string, workspaceId: string): Promise<ProjectView | null>;
  findByWorkspace(workspaceId: string): Promise<ProjectView[]>;
  findByIdentifier(workspaceId: string, identifier: string): Promise<Project | null>;
  save(project: Project): Promise<void>;
  delete(id: string): Promise<void>;
}

export const PROJECT_REPOSITORY = Symbol('IProjectRepository');
