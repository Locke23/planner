import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/require-role.decorator';
import { RoleValue } from '../../domain/value-objects/role.vo';
import { WORKSPACE_REPOSITORY } from '../../domain/repositories/iworkspace.repository';
import type { IWorkspaceRepository } from '../../domain/repositories/iworkspace.repository';

const ROLE_HIERARCHY: Record<RoleValue, number> = {
  [RoleValue.OWNER]: 3,
  [RoleValue.ADMIN]: 2,
  [RoleValue.MEMBER]: 1,
};

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(WORKSPACE_REPOSITORY) private readonly workspaces: IWorkspaceRepository,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();
    const { userId } = request.user as { userId: string };
    const slug: string = request.params.slug;

    const workspace = await this.workspaces.findBySlug(slug);
    if (!workspace) throw new NotFoundException('Workspace not found');

    const member = workspace.getMember(userId);
    if (!member) throw new ForbiddenException('Not a member of this workspace');

    request.workspace = workspace;

    const requiredRole = this.reflector.getAllAndOverride<RoleValue>(ROLE_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!requiredRole) return true;

    const memberLevel = ROLE_HIERARCHY[member.role as RoleValue] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;

    if (memberLevel < requiredLevel) {
      throw new ForbiddenException(`Requires ${requiredRole} or higher`);
    }
    return true;
  }
}
