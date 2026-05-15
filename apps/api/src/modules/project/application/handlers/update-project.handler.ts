import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateProjectCommand } from '../commands/update-project.command';
import { PROJECT_REPOSITORY } from '../../domain/repositories/iproject.repository';
import type { IProjectRepository } from '../../domain/repositories/iproject.repository';
import { Project } from '../../domain/entities/project.entity';
import { ProjectNotFoundException } from '../../domain/exceptions/project-not-found.exception';

@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler implements ICommandHandler<UpdateProjectCommand> {
  constructor(@Inject(PROJECT_REPOSITORY) private readonly projects: IProjectRepository) {}

  async execute(cmd: UpdateProjectCommand): Promise<Project> {
    const project = await this.projects.findById(cmd.projectId);
    if (!project || project.workspaceId !== cmd.workspaceId) throw new ProjectNotFoundException();
    project.update(cmd.name, cmd.description);
    await this.projects.save(project);
    return project;
  }
}
