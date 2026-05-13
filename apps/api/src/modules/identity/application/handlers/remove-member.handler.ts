import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { RemoveMemberCommand } from '../commands/remove-member.command';
import { WORKSPACE_REPOSITORY } from '../../domain/repositories/iworkspace.repository';
import type { IWorkspaceRepository } from '../../domain/repositories/iworkspace.repository';
import { EventBusService } from '../../../../shared/infra/event-bus.service';

@CommandHandler(RemoveMemberCommand)
export class RemoveMemberHandler implements ICommandHandler<RemoveMemberCommand> {
  constructor(
    @Inject(WORKSPACE_REPOSITORY) private readonly workspaces: IWorkspaceRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(cmd: RemoveMemberCommand): Promise<void> {
    const workspace = await this.workspaces.findById(cmd.workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    workspace.removeMember(cmd.targetUserId, cmd.actorId);
    await this.workspaces.save(workspace);
    this.eventBus.publishAll(workspace);
  }
}
