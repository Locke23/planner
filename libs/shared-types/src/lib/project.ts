export type StatusType = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type Priority = 'NO_PRIORITY' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface StatusDto {
  id: string;
  projectId: string;
  name: string;
  color: string;
  type: StatusType;
  position: number;
}

export interface LabelDto {
  id: string;
  projectId: string;
  name: string;
  color: string;
}

export interface ProjectDto {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  identifier: string;
  statuses: StatusDto[];
  labels: LabelDto[];
  issueCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  identifier: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}

export interface CreateStatusDto {
  name: string;
  color: string;
  type: StatusType;
}

export interface ReorderStatusesDto {
  orderedIds: string[];
}
