import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  createWorkspace, listWorkspaces, getWorkspace, getWorkspaceMembers,
  inviteMember, removeMember,
} from '../api/workspace.api';
import type { CreateWorkspaceDto, InviteMemberDto } from '@org/shared-types';

export function useWorkspaces() {
  return useQuery({ queryKey: ['workspaces'], queryFn: listWorkspaces });
}

export function useWorkspace(slug: string) {
  return useQuery({ queryKey: ['workspaces', slug], queryFn: () => getWorkspace(slug), enabled: !!slug });
}

export function useWorkspaceMembers(slug: string) {
  return useQuery({ queryKey: ['workspaces', slug, 'members'], queryFn: () => getWorkspaceMembers(slug), enabled: !!slug });
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (dto: CreateWorkspaceDto) => createWorkspace(dto),
    onSuccess: (ws) => {
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      navigate({ to: '/$workspaceSlug', params: { workspaceSlug: ws.slug } });
    },
  });
}

export function useInviteMember(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: InviteMemberDto) => inviteMember(slug, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspaces', slug, 'members'] }),
  });
}

export function useRemoveMember(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeMember(slug, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspaces', slug, 'members'] }),
  });
}
