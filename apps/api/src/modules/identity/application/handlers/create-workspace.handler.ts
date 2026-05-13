import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { CreateWorkspaceCommand } from '../commands/create-workspace.command';
import { WORKSPACE_REPOSITORY } from '../../domain/repositories/iworkspace.repository';
import type { IWorkspaceRepository } from '../../domain/repositories/iworkspace.repository';
import { Workspace } from '../../domain/entities/workspace.entity';
import { EventBusService } from '../../../../shared/infra/event-bus.service';

@CommandHandler(CreateWorkspaceCommand)
export class CreateWorkspaceHandler implements ICommandHandler<CreateWorkspaceCommand> {
  constructor(
    @Inject(WORKSPACE_REPOSITORY) private readonly workspaces: IWorkspaceRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(cmd: CreateWorkspaceCommand): Promise<Workspace> {
    const existing = await this.workspaces.findBySlug(cmd.slug);
    if (existing) throw new ConflictException('Workspace slug already taken');
    const workspace = Workspace.create(cmd.name, cmd.slug, cmd.ownerId);
    await this.workspaces.save(workspace);
    this.eventBus.publishAll(workspace);
    return workspace;
  }
}
