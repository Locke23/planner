import { api } from '../../../shared/lib/axios';
import type {
  CreateWorkspaceDto,
  WorkspaceDto,
  WorkspaceMemberDto,
  InviteMemberDto,
  InvitationResponse,
} from '@org/shared-types';

export async function createWorkspace(dto: CreateWorkspaceDto): Promise<WorkspaceDto> {
  const { data } = await api.post<WorkspaceDto>('/workspaces', dto);
  return data;
}

export async function listWorkspaces(): Promise<WorkspaceDto[]> {
  const { data } = await api.get<WorkspaceDto[]>('/workspaces');
  return data;
}

export async function getWorkspace(slug: string): Promise<WorkspaceDto> {
  const { data } = await api.get<WorkspaceDto>(`/workspaces/${slug}`);
  return data;
}

export async function getWorkspaceMembers(slug: string): Promise<WorkspaceMemberDto[]> {
  const { data } = await api.get<WorkspaceMemberDto[]>(`/workspaces/${slug}/members`);
  return data;
}

export async function inviteMember(slug: string, dto: InviteMemberDto): Promise<InvitationResponse> {
  const { data } = await api.post<InvitationResponse>(`/workspaces/${slug}/invitations`, dto);
  return data;
}

export async function removeMember(slug: string, userId: string): Promise<void> {
  await api.delete(`/workspaces/${slug}/members/${userId}`);
}

export async function acceptInvitation(token: string): Promise<void> {
  await api.post(`/workspaces/invitations/${token}/accept`);
}
