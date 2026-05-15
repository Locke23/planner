import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus, Request,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProjectCommand } from '../../application/commands/create-project.command';
import { UpdateProjectCommand } from '../../application/commands/update-project.command';
import { DeleteProjectCommand } from '../../application/commands/delete-project.command';
import { GetProjectQuery } from '../../application/queries/get-project.query';
import { ListProjectsQuery } from '../../application/queries/list-projects.query';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { WorkspaceRoleGuard } from '../../../identity/presentation/guards/workspace-role.guard';
import { RequireRole } from '../../../identity/presentation/decorators/require-role.decorator';
import { RoleValue } from '../../../identity/domain/value-objects/role.vo';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';
import type { ProjectView } from '../../domain/repositories/iproject.repository';
import type { Project } from '../../domain/entities/project.entity';
import { Workspace } from '../../../identity/domain/entities/workspace.entity';

interface WorkspaceRequest extends Request {
  workspace: Workspace;
}

@Controller('workspaces/:slug/projects')
@UseGuards(JwtAuthGuard, WorkspaceRoleGuard)
export class ProjectController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async list(@Request() req: WorkspaceRequest): Promise<ProjectView[]> {
    return this.queryBus.execute(new ListProjectsQuery(req.workspace.id));
  }

  @Post()
  @RequireRole(RoleValue.ADMIN)
  async create(
    @Request() req: WorkspaceRequest,
    @Body() dto: CreateProjectDto,
  ): Promise<ProjectView> {
    const project: Project = await this.commandBus.execute(
      new CreateProjectCommand(dto.name, dto.identifier, req.workspace.id, dto.description),
    );
    return this.queryBus.execute(new GetProjectQuery(project.id, req.workspace.id));
  }

  @Get(':projectId')
  async getOne(
    @Request() req: WorkspaceRequest,
    @Param('projectId') projectId: string,
  ): Promise<ProjectView> {
    return this.queryBus.execute(new GetProjectQuery(projectId, req.workspace.id));
  }

  @Patch(':projectId')
  @RequireRole(RoleValue.ADMIN)
  async update(
    @Request() req: WorkspaceRequest,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectView> {
    await this.commandBus.execute(
      new UpdateProjectCommand(projectId, req.workspace.id, dto.name, dto.description),
    );
    return this.queryBus.execute(new GetProjectQuery(projectId, req.workspace.id));
  }

  @Delete(':projectId')
  @RequireRole(RoleValue.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Request() req: WorkspaceRequest,
    @Param('projectId') projectId: string,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteProjectCommand(projectId, req.workspace.id));
  }
}
