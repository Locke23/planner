import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetProjectQuery } from '../queries/get-project.query';
import { PROJECT_REPOSITORY } from '../../domain/repositories/iproject.repository';
import type { IProjectRepository, ProjectView } from '../../domain/repositories/iproject.repository';
import { ProjectNotFoundException } from '../../domain/exceptions/project-not-found.exception';

@QueryHandler(GetProjectQuery)
export class GetProjectHandler implements IQueryHandler<GetProjectQuery> {
  constructor(@Inject(PROJECT_REPOSITORY) private readonly projects: IProjectRepository) {}

  async execute(query: GetProjectQuery): Promise<ProjectView> {
    const view = await this.projects.findViewById(query.projectId, query.workspaceId);
    if (!view) throw new ProjectNotFoundException();
    return view;
  }
}
