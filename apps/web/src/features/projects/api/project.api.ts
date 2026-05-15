import { api } from '../../../shared/lib/axios';
import type { ProjectDto, CreateProjectDto, UpdateProjectDto } from '@org/shared-types';

export async function listProjects(workspaceSlug: string): Promise<ProjectDto[]> {
  const { data } = await api.get<ProjectDto[]>(`/workspaces/${workspaceSlug}/projects`);
  return data;
}

export async function getProject(workspaceSlug: string, projectId: string): Promise<ProjectDto> {
  const { data } = await api.get<ProjectDto>(`/workspaces/${workspaceSlug}/projects/${projectId}`);
  return data;
}

export async function createProject(workspaceSlug: string, dto: CreateProjectDto): Promise<ProjectDto> {
  const { data } = await api.post<ProjectDto>(`/workspaces/${workspaceSlug}/projects`, dto);
  return data;
}

export async function updateProject(workspaceSlug: string, projectId: string, dto: UpdateProjectDto): Promise<ProjectDto> {
  const { data } = await api.patch<ProjectDto>(`/workspaces/${workspaceSlug}/projects/${projectId}`, dto);
  return data;
}

export async function deleteProject(workspaceSlug: string, projectId: string): Promise<void> {
  await api.delete(`/workspaces/${workspaceSlug}/projects/${projectId}`);
}
