import type { Priority } from './project.js';

export type { Priority };

export interface IssueDto {
  id: string;
  projectId: string;
  workspaceId: string;
  number: number;
  identifier: string; // e.g. "PLN-1"
  title: string;
  description: string | null;
  statusId: string;
  assigneeId: string | null;
  priority: Priority;
  labelIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueDto {
  title: string;
  description?: string;
  statusId?: string;
  assigneeId?: string;
  priority?: Priority;
  labelIds?: string[];
}

export interface UpdateIssueDto {
  title?: string;
  description?: string;
  statusId?: string;
  assigneeId?: string | null;
  priority?: Priority;
  labelIds?: string[];
}

export interface IssueFilters {
  status?: string;
  assignee?: string;
  priority?: string; // comma-separated: "HIGH,URGENT"
  label?: string;
  q?: string;
}

export interface PaginatedIssuesDto {
  data: IssueDto[];
  total: number;
  page: number;
  pageSize: number;
}
