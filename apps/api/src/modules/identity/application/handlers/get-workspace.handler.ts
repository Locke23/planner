import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetWorkspaceQuery } from '../queries/get-workspace.query';
import { WORKSPACE_REPOSITORY } from '../../domain/repositories/iworkspace.repository';
import type { IWorkspaceRepository } from '../../domain/repositories/iworkspace.repository';
import { Workspace } from '../../domain/entities/workspace.entity';

@QueryHandler(GetWorkspaceQuery)
export class GetWorkspaceHandler implements IQueryHandler<GetWorkspaceQuery> {
  constructor(@Inject(WORKSPACE_REPOSITORY) private readonly workspaces: IWorkspaceRepository) {}

  async execute(query: GetWorkspaceQuery): Promise<Workspace> {
    const workspace = await this.workspaces.findBySlug(query.slug);
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (!workspace.hasMember(query.requesterId)) throw new ForbiddenException('Access denied');
    return workspace;
  }
}
