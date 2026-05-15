import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listIssues, getIssue, createIssue, updateIssue, deleteIssue } from '../api/issue.api';
import type { CreateIssueDto, UpdateIssueDto, IssueDto, IssueFilters } from '@org/shared-types';

export const issueKeys = {
  all: ['issues'] as const,
  list: (slug: string, projectId: string, filters?: IssueFilters) =>
    ['issues', slug, projectId, 'list', filters ?? {}] as const,
  detail: (slug: string, projectId: string, number: number) =>
    ['issues', slug, projectId, number] as const,
};

export function useIssues(workspaceSlug: string, projectId: string, filters?: IssueFilters) {
  return useQuery({
    queryKey: issueKeys.list(workspaceSlug, projectId, filters),
    queryFn: () => listIssues(workspaceSlug, projectId, filters),
    enabled: !!workspaceSlug && !!projectId,
  });
}

export function useIssue(workspaceSlug: string, projectId: string, issueNumber: number) {
  return useQuery({
    queryKey: issueKeys.detail(workspaceSlug, projectId, issueNumber),
    queryFn: () => getIssue(workspaceSlug, projectId, issueNumber),
    enabled: !!workspaceSlug && !!projectId && issueNumber > 0,
  });
}

export function useCreateIssue(workspaceSlug: string, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateIssueDto) => createIssue(workspaceSlug, projectId, dto),
    onMutate: async (dto: CreateIssueDto) => {
      await qc.cancelQueries({ queryKey: issueKeys.list(workspaceSlug, projectId) });
      const previous = qc.getQueryData(issueKeys.list(workspaceSlug, projectId));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(issueKeys.list(workspaceSlug, projectId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: issueKeys.list(workspaceSlug, projectId) });
    },
  });
}

export function useUpdateIssue(workspaceSlug: string, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, patch }: { issueId: string; patch: UpdateIssueDto }) =>
      updateIssue(workspaceSlug, projectId, issueId, patch),
    onMutate: async ({ issueId, patch }: { issueId: string; patch: UpdateIssueDto }) => {
      await qc.cancelQueries({ queryKey: issueKeys.list(workspaceSlug, projectId) });
      const previous = qc.getQueryData(issueKeys.list(workspaceSlug, projectId));
      qc.setQueryData(
        issueKeys.list(workspaceSlug, projectId),
        (old: IssueDto[] | undefined) =>
          old?.map((i) => (i.id === issueId ? { ...i, ...patch } : i)) ?? [],
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(issueKeys.list(workspaceSlug, projectId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: issueKeys.list(workspaceSlug, projectId) });
    },
  });
}

export function useDeleteIssue(workspaceSlug: string, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (issueId: string) => deleteIssue(workspaceSlug, projectId, issueId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: issueKeys.list(workspaceSlug, projectId) });
    },
  });
}
