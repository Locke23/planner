import {
  Controller, Post, Get, Patch, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus, Request,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request as ExpressRequest } from 'express';
import { CreateWorkspaceCommand } from '../../application/commands/create-workspace.command';
import { InviteMemberCommand } from '../../application/commands/invite-member.command';
import { AcceptInvitationCommand } from '../../application/commands/accept-invitation.command';
import { RemoveMemberCommand } from '../../application/commands/remove-member.command';
import { ChangeMemberRoleCommand } from '../../application/commands/change-member-role.command';
import { GetWorkspaceQuery } from '../../application/queries/get-workspace.query';
import { GetWorkspaceMembersQuery } from '../../application/queries/get-workspace-members.query';
import { ListWorkspacesQuery } from '../../application/queries/list-workspaces.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceRoleGuard } from '../guards/workspace-role.guard';
import { RequireRole } from '../decorators/require-role.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateWorkspaceDto } from '../dtos/create-workspace.dto';
import { InviteMemberDto } from '../dtos/invite-member.dto';
import { ChangeMemberRoleDto } from '../dtos/change-member-role.dto';
import { RoleValue } from '../../domain/value-objects/role.vo';
import { Workspace } from '../../domain/entities/workspace.entity';
import { Member } from '../../domain/entities/member.entity';
import type { InvitationRecord } from '../../domain/repositories/iinvitation.repository';

interface WorkspaceRequest extends ExpressRequest {
  workspace: Workspace;
}

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateWorkspaceDto, @CurrentUser() user: { userId: string }) {
    const ws: Workspace = await this.commandBus.execute(
      new CreateWorkspaceCommand(dto.name, dto.slug, user.userId),
    );
    return this.serialize(ws);
  }

  @Get()
  async list(@CurrentUser() user: { userId: string }) {
    const workspaces: Workspace[] = await this.queryBus.execute(new ListWorkspacesQuery(user.userId));
    return workspaces.map(ws => this.serialize(ws));
  }

  @Get(':slug')
  @UseGuards(WorkspaceRoleGuard)
  async getOne(@Param('slug') slug: string, @CurrentUser() user: { userId: string }) {
    const ws: Workspace = await this.queryBus.execute(new GetWorkspaceQuery(slug, user.userId));
    return this.serialize(ws);
  }

  @Post('invitations/:token/accept')
  @HttpCode(HttpStatus.NO_CONTENT)
  async acceptInvitation(@Param('token') token: string, @CurrentUser() user: { userId: string }) {
    await this.commandBus.execute(new AcceptInvitationCommand(token, user.userId));
  }

  @Get(':slug/members')
  @UseGuards(WorkspaceRoleGuard)
  async getMembers(@Request() req: WorkspaceRequest, @CurrentUser() user: { userId: string }) {
    const ws: Workspace = req.workspace;
    const members: Member[] = await this.queryBus.execute(
      new GetWorkspaceMembersQuery(ws.id, user.userId),
    );
    return members.map(m => ({ userId: m.userId, role: m.role, joinedAt: m.joinedAt }));
  }

  @Post(':slug/invitations')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(RoleValue.ADMIN)
  async invite(
    @Request() req: WorkspaceRequest,
    @Body() dto: InviteMemberDto,
    @CurrentUser() user: { userId: string },
  ) {
    const ws: Workspace = req.workspace;
    const invitation: InvitationRecord = await this.commandBus.execute(
      new InviteMemberCommand(ws.id, dto.email, dto.role, user.userId),
    );
    return { token: invitation.token, email: invitation.email, expiresAt: invitation.expiresAt };
  }

  @Delete(':slug/members/:userId')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(RoleValue.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Request() req: WorkspaceRequest,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: { userId: string },
  ) {
    const ws: Workspace = req.workspace;
    await this.commandBus.execute(new RemoveMemberCommand(ws.id, targetUserId, user.userId));
  }

  @Patch(':slug/members/:userId/role')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(RoleValue.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeMemberRole(
    @Request() req: WorkspaceRequest,
    @Param('userId') targetUserId: string,
    @Body() dto: ChangeMemberRoleDto,
    @CurrentUser() user: { userId: string },
  ) {
    const ws: Workspace = req.workspace;
    await this.commandBus.execute(new ChangeMemberRoleCommand(ws.id, targetUserId, dto.role, user.userId));
  }

  private serialize(ws: Workspace) {
    return {
      id: ws.id,
      name: ws.name,
      slug: ws.slug.value,
      ownerId: ws.ownerId,
      memberCount: ws.members.length,
      createdAt: ws.createdAt,
      updatedAt: ws.updatedAt,
    };
  }
}
