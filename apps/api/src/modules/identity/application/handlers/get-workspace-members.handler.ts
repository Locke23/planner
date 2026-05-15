import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetWorkspaceMembersQuery } from '../queries/get-workspace-members.query';
import { WORKSPACE_REPOSITORY } from '../../domain/repositories/iworkspace.repository';
import type { IWorkspaceRepository } from '../../domain/repositories/iworkspace.repository';
import { USER_REPOSITORY } from '../../domain/repositories/iuser.repository';
import type { IUserRepository } from '../../domain/repositories/iuser.repository';

export interface WorkspaceMemberView {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  joinedAt: Date;
}

@QueryHandler(GetWorkspaceMembersQuery)
export class GetWorkspaceMembersHandler implements IQueryHandler<GetWorkspaceMembersQuery> {
  constructor(
    @Inject(WORKSPACE_REPOSITORY) private readonly workspaces: IWorkspaceRepository,
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
  ) {}

  async execute(query: GetWorkspaceMembersQuery): Promise<WorkspaceMemberView[]> {
    const workspace = await this.workspaces.findById(query.workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (!workspace.hasMember(query.requesterId)) throw new ForbiddenException('Access denied');

    const views = await Promise.all(
      workspace.members.map(async (member) => {
        const user = await this.users.findById(member.userId);
        return {
          id: member.userId,
          name: user?.name ?? 'Unknown',
          email: user?.email.value ?? '',
          avatarUrl: user?.avatarUrl ?? null,
          role: member.role,
          joinedAt: member.joinedAt,
        } satisfies WorkspaceMemberView;
      }),
    );

    return views;
  }
}
