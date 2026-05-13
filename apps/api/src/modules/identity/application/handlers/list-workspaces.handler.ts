import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListWorkspacesQuery } from '../queries/list-workspaces.query';
import { WORKSPACE_REPOSITORY } from '../../domain/repositories/iworkspace.repository';
import type { IWorkspaceRepository } from '../../domain/repositories/iworkspace.repository';
import { Workspace } from '../../domain/entities/workspace.entity';

@QueryHandler(ListWorkspacesQuery)
export class ListWorkspacesHandler implements IQueryHandler<ListWorkspacesQuery> {
  constructor(@Inject(WORKSPACE_REPOSITORY) private readonly workspaces: IWorkspaceRepository) {}

  async execute(query: ListWorkspacesQuery): Promise<Workspace[]> {
    return this.workspaces.findByUserId(query.userId);
  }
}
