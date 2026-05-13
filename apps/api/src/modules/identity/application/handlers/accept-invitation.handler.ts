import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { AcceptInvitationCommand } from '../commands/accept-invitation.command';
import { WORKSPACE_REPOSITORY } from '../../domain/repositories/iworkspace.repository';
import type { IWorkspaceRepository } from '../../domain/repositories/iworkspace.repository';
import { INVITATION_REPOSITORY } from '../../domain/repositories/iinvitation.repository';
import type { IInvitationRepository } from '../../domain/repositories/iinvitation.repository';
import { EventBusService } from '../../../../shared/infra/event-bus.service';

@CommandHandler(AcceptInvitationCommand)
export class AcceptInvitationHandler implements ICommandHandler<AcceptInvitationCommand> {
  constructor(
    @Inject(WORKSPACE_REPOSITORY) private readonly workspaces: IWorkspaceRepository,
    @Inject(INVITATION_REPOSITORY) private readonly invitations: IInvitationRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(cmd: AcceptInvitationCommand): Promise<void> {
    const invitation = await this.invitations.findByToken(cmd.token);
    if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
      throw new NotFoundException('Invalid or expired invitation');
    }
    const workspace = await this.workspaces.findById(invitation.workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    workspace.addMemberDirectly(cmd.userId, invitation.role);
    await this.workspaces.save(workspace);
    await this.invitations.markAccepted(invitation.id);
    this.eventBus.publishAll(workspace);
  }
}
