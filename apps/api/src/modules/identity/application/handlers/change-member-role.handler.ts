import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ChangeMemberRoleCommand } from '../commands/change-member-role.command';
import { WORKSPACE_REPOSITORY } from '../../domain/repositories/iworkspace.repository';
import type { IWorkspaceRepository } from '../../domain/repositories/iworkspace.repository';
import { EventBusService } from '../../../../shared/infra/event-bus.service';

@CommandHandler(ChangeMemberRoleCommand)
export class ChangeMemberRoleHandler implements ICommandHandler<ChangeMemberRoleCommand> {
  constructor(
    @Inject(WORKSPACE_REPOSITORY) private readonly workspaces: IWorkspaceRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(cmd: ChangeMemberRoleCommand): Promise<void> {
    const workspace = await this.workspaces.findById(cmd.workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    workspace.changeMemberRole(cmd.targetUserId, cmd.newRole, cmd.actorId);
    await this.workspaces.save(workspace);
    this.eventBus.publishAll(workspace);
  }
}
