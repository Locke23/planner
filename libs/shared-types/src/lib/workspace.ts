export interface CreateWorkspaceDto {
  name: string;
  slug: string;
}

export interface WorkspaceDto {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface MemberDto {
  userId: string;
  role: MemberRole;
  joinedAt: string;
}

// Enriched member returned by the list-members endpoint (JOIN with users table)
export interface WorkspaceMemberDto {
  id: string;       // userId
  name: string;
  email: string;
  avatarUrl: string | null;
  role: MemberRole;
  joinedAt: string;
}

export interface InviteMemberDto {
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface InvitationResponse {
  token: string;
  email: string;
  expiresAt: string;
}
