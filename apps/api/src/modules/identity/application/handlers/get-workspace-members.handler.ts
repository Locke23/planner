import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetWorkspaceMembersQuery } from '../queries/get-workspace-members.query';
import { WORKSPACE_REPOSITORY } from '../../domain/repositories/iworkspace.repository';
import type { IWorkspaceRepository } from '../../domain/repositories/iworkspace.repository';
import { Member } from '../../domain/entities/member.entity';

@QueryHandler(GetWorkspaceMembersQuery)
export class GetWorkspaceMembersHandler implements IQueryHandler<GetWorkspaceMembersQuery> {
  constructor(@Inject(WORKSPACE_REPOSITORY) private readonly workspaces: IWorkspaceRepository) {}

  async execute(query: GetWorkspaceMembersQuery): Promise<Member[]> {
    const workspace = await this.workspaces.findById(query.workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (!workspace.hasMember(query.requesterId)) throw new ForbiddenException('Access denied');
    return workspace.members;
  }
}
