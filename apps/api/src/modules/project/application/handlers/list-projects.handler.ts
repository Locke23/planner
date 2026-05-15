import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListProjectsQuery } from '../queries/list-projects.query';
import { PROJECT_REPOSITORY } from '../../domain/repositories/iproject.repository';
import type { IProjectRepository, ProjectView } from '../../domain/repositories/iproject.repository';

@QueryHandler(ListProjectsQuery)
export class ListProjectsHandler implements IQueryHandler<ListProjectsQuery> {
  constructor(@Inject(PROJECT_REPOSITORY) private readonly projects: IProjectRepository) {}

  async execute(query: ListProjectsQuery): Promise<ProjectView[]> {
    return this.projects.findByWorkspace(query.workspaceId);
  }
}
