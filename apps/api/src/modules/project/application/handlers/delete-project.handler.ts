import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteProjectCommand } from '../commands/delete-project.command';
import { PROJECT_REPOSITORY } from '../../domain/repositories/iproject.repository';
import type { IProjectRepository } from '../../domain/repositories/iproject.repository';
import { ProjectNotFoundException } from '../../domain/exceptions/project-not-found.exception';

@CommandHandler(DeleteProjectCommand)
export class DeleteProjectHandler implements ICommandHandler<DeleteProjectCommand> {
  constructor(@Inject(PROJECT_REPOSITORY) private readonly projects: IProjectRepository) {}

  async execute(cmd: DeleteProjectCommand): Promise<void> {
    const project = await this.projects.findById(cmd.projectId);
    if (!project || project.workspaceId !== cmd.workspaceId) throw new ProjectNotFoundException();
    await this.projects.delete(cmd.projectId);
  }
}
