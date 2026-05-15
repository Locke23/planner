import type { Issue } from '../entities/issue.entity';

export interface IssueFilters {
  status?: string;
  assignee?: string;
  priority?: string;
  label?: string;
  q?: string;
}

export interface IssueView {
  id: string;
  projectId: string;
  workspaceId: string;
  number: number;
  identifier: string;
  title: string;
  description: string | null;
  statusId: string;
  assigneeId: string | null;
  priority: string;
  labelIds: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIssueRepository {
  findById(id: string): Promise<Issue | null>;
  findByNumber(projectId: string, number: number): Promise<Issue | null>;
  findView(id: string): Promise<IssueView | null>;
  findViewByNumber(projectId: string, number: number): Promise<IssueView | null>;
  findByProject(projectId: string, filters?: IssueFilters): Promise<IssueView[]>;
  create(issue: Issue, labelIds: string[]): Promise<void>;
  save(issue: Issue, labelIds?: string[]): Promise<void>;
  delete(id: string): Promise<void>;
  nextNumber(projectId: string): Promise<number>;
}

export const ISSUE_REPOSITORY = Symbol('IIssueRepository');
