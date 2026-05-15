import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus, Request,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateIssueCommand } from '../../application/commands/create-issue.command';
import { UpdateIssueCommand } from '../../application/commands/update-issue.command';
import { DeleteIssueCommand } from '../../application/commands/delete-issue.command';
import { GetIssueQuery, GetIssueByNumberQuery } from '../../application/queries/get-issue.query';
import { ListIssuesQuery } from '../../application/queries/list-issues.query';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { WorkspaceRoleGuard } from '../../../identity/presentation/guards/workspace-role.guard';
import { CreateIssueDto } from '../dtos/create-issue.dto';
import { UpdateIssueDto } from '../dtos/update-issue.dto';
import type { IssueView, IssueFilters } from '../../domain/repositories/iissue.repository';
import { Workspace } from '../../../identity/domain/entities/workspace.entity';

interface WorkspaceRequest extends Request {
  workspace: Workspace;
}

@Controller('workspaces/:slug/projects/:projectId/issues')
@UseGuards(JwtAuthGuard, WorkspaceRoleGuard)
export class IssueController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async list(
    @Param('projectId') projectId: string,
    @Query('status') status?: string,
    @Query('assignee') assignee?: string,
    @Query('priority') priority?: string,
    @Query('label') label?: string,
    @Query('q') q?: string,
  ): Promise<IssueView[]> {
    const filters: IssueFilters = {};
    if (status) filters.status = status;
    if (assignee) filters.assignee = assignee;
    if (priority) filters.priority = priority;
    if (label) filters.label = label;
    if (q) filters.q = q;

    return this.queryBus.execute(new ListIssuesQuery(projectId, filters));
  }

  @Post()
  async create(
    @Request() req: WorkspaceRequest,
    @Param('projectId') projectId: string,
    @Body() dto: CreateIssueDto,
  ): Promise<IssueView> {
    const issueId: string = await this.commandBus.execute(
      new CreateIssueCommand(
        projectId,
        req.workspace.id,
        (req as any).user.userId,
        dto.title,
        dto.statusId,
        dto.description,
        dto.assigneeId,
        dto.priority,
        dto.labelIds,
      ),
    );
    return this.queryBus.execute(new GetIssueQuery(issueId, projectId));
  }

  @Get(':numberOrId')
  async getOne(
    @Param('projectId') projectId: string,
    @Param('numberOrId') numberOrId: string,
  ): Promise<IssueView> {
    if (!isNaN(+numberOrId)) {
      return this.queryBus.execute(new GetIssueByNumberQuery(projectId, +numberOrId));
    }
    return this.queryBus.execute(new GetIssueQuery(numberOrId, projectId));
  }

  @Patch(':id')
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateIssueDto,
  ): Promise<IssueView> {
    await this.commandBus.execute(
      new UpdateIssueCommand(
        id,
        projectId,
        dto.title,
        dto.description,
        dto.statusId,
        dto.assigneeId,
        dto.priority,
        dto.labelIds,
      ),
    );
    return this.queryBus.execute(new GetIssueQuery(id, projectId));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteIssueCommand(id, projectId));
  }
}
