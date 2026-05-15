import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InviteMemberCommand } from '../commands/invite-member.command';
import { WORKSPACE_REPOSITORY } from '../../domain/repositories/iworkspace.repository';
import type { IWorkspaceRepository } from '../../domain/repositories/iworkspace.repository';
import { INVITATION_REPOSITORY } from '../../domain/repositories/iinvitation.repository';
import type { IInvitationRepository, InvitationRecord } from '../../domain/repositories/iinvitation.repository';

@CommandHandler(InviteMemberCommand)
export class InviteMemberHandler implements ICommandHandler<InviteMemberCommand> {
  constructor(
    @Inject(WORKSPACE_REPOSITORY) private readonly workspaces: IWorkspaceRepository,
    @Inject(INVITATION_REPOSITORY) private readonly invitations: IInvitationRepository,
  ) {}

  async execute(cmd: InviteMemberCommand): Promise<InvitationRecord> {
    const workspace = await this.workspaces.findById(cmd.workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    const invitation: InvitationRecord = {
      id: randomUUID(),
      workspaceId: cmd.workspaceId,
      email: cmd.email.toLowerCase(),
      role: cmd.role,
      token: randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      acceptedAt: null,
      createdAt: new Date(),
    };
    await this.invitations.save(invitation);
    return invitation;
  }
}
