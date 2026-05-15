import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateStatusCommand } from '../../application/commands/create-status.command';
import { UpdateStatusCommand } from '../../application/commands/update-status.command';
import { DeleteStatusCommand } from '../../application/commands/delete-status.command';
import { ReorderStatusesCommand } from '../../application/commands/reorder-statuses.command';
import { ListStatusesQuery } from '../../application/queries/list-statuses.query';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { WorkspaceRoleGuard } from '../../../identity/presentation/guards/workspace-role.guard';
import { RequireRole } from '../../../identity/presentation/decorators/require-role.decorator';
import { RoleValue } from '../../../identity/domain/value-objects/role.vo';
import { CreateStatusDto } from '../dtos/create-status.dto';
import { UpdateStatusDto } from '../dtos/update-status.dto';
import { ReorderStatusesDto } from '../dtos/reorder-statuses.dto';
import type { StatusView } from '../../domain/repositories/istatus.repository';

@Controller('workspaces/:slug/projects/:projectId/statuses')
@UseGuards(JwtAuthGuard, WorkspaceRoleGuard)
export class StatusController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async list(@Param('projectId') projectId: string): Promise<StatusView[]> {
    return this.queryBus.execute(new ListStatusesQuery(projectId));
  }

  @Post()
  @RequireRole(RoleValue.ADMIN)
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateStatusDto,
  ): Promise<StatusView> {
    return this.commandBus.execute(
      new CreateStatusCommand(projectId, dto.name, dto.color, dto.type),
    );
  }

  @Post('reorder')
  @RequireRole(RoleValue.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorder(
    @Param('projectId') projectId: string,
    @Body() dto: ReorderStatusesDto,
  ): Promise<void> {
    await this.commandBus.execute(new ReorderStatusesCommand(projectId, dto.orderedIds));
  }

  @Patch(':statusId')
  @RequireRole(RoleValue.ADMIN)
  async update(
    @Param('projectId') projectId: string,
    @Param('statusId') statusId: string,
    @Body() dto: UpdateStatusDto,
  ): Promise<StatusView> {
    await this.commandBus.execute(new UpdateStatusCommand(statusId, projectId, dto.name, dto.color));
    const statuses: StatusView[] = await this.queryBus.execute(new ListStatusesQuery(projectId));
    return statuses.find(s => s.id === statusId)!;
  }

  @Delete(':statusId')
  @RequireRole(RoleValue.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('projectId') projectId: string,
    @Param('statusId') statusId: string,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteStatusCommand(statusId, projectId));
  }
}
