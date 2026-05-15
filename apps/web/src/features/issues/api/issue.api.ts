import { api } from '../../../shared/lib/axios';
import type { IssueDto, CreateIssueDto, UpdateIssueDto, IssueFilters } from '@org/shared-types';

export async function listIssues(
  workspaceSlug: string,
  projectId: string,
  filters?: IssueFilters,
): Promise<IssueDto[]> {
  const { data } = await api.get<IssueDto[]>(`/workspaces/${workspaceSlug}/projects/${projectId}/issues`, {
    params: filters,
  });
  return data;
}

export async function getIssue(
  workspaceSlug: string,
  projectId: string,
  number: number,
): Promise<IssueDto> {
  const { data } = await api.get<IssueDto>(
    `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${number}`,
  );
  return data;
}

export async function createIssue(
  workspaceSlug: string,
  projectId: string,
  dto: CreateIssueDto,
): Promise<IssueDto> {
  const { data } = await api.post<IssueDto>(
    `/workspaces/${workspaceSlug}/projects/${projectId}/issues`,
    dto,
  );
  return data;
}

export async function updateIssue(
  workspaceSlug: string,
  projectId: string,
  issueId: string,
  dto: UpdateIssueDto,
): Promise<IssueDto> {
  const { data } = await api.patch<IssueDto>(
    `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`,
    dto,
  );
  return data;
}

export async function deleteIssue(
  workspaceSlug: string,
  projectId: string,
  issueId: string,
): Promise<void> {
  await api.delete(`/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`);
}
