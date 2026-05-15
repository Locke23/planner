import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listProjects, getProject, createProject, updateProject, deleteProject } from '../api/project.api';
import type { CreateProjectDto, UpdateProjectDto } from '@org/shared-types';

export const projectKeys = {
  all: ['projects'] as const,
  list: (slug: string) => ['projects', slug, 'list'] as const,
  detail: (slug: string, id: string) => ['projects', slug, id] as const,
};

export function useProjects(workspaceSlug: string) {
  return useQuery({
    queryKey: projectKeys.list(workspaceSlug),
    queryFn: () => listProjects(workspaceSlug),
    enabled: !!workspaceSlug,
  });
}

export function useProject(workspaceSlug: string, projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(workspaceSlug, projectId),
    queryFn: () => getProject(workspaceSlug, projectId),
    enabled: !!workspaceSlug && !!projectId,
  });
}

export function useCreateProject(workspaceSlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProjectDto) => createProject(workspaceSlug, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.list(workspaceSlug) });
    },
  });
}

export function useUpdateProject(workspaceSlug: string, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProjectDto) => updateProject(workspaceSlug, projectId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(workspaceSlug, projectId) });
    },
  });
}

export function useDeleteProject(workspaceSlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => deleteProject(workspaceSlug, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.list(workspaceSlug) });
    },
  });
}
