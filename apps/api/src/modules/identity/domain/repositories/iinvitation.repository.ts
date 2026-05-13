export interface InvitationRecord {
  id: string;
  workspaceId: string;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

export interface IInvitationRepository {
  findByToken(token: string): Promise<InvitationRecord | null>;
  save(invitation: InvitationRecord): Promise<void>;
  markAccepted(id: string): Promise<void>;
}

export const INVITATION_REPOSITORY = Symbol('IInvitationRepository');
