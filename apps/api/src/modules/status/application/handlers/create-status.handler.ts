import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateStatusCommand } from '../commands/create-status.command';
import { STATUS_REPOSITORY } from '../../domain/repositories/istatus.repository';
import type { IStatusRepository, StatusView } from '../../domain/repositories/istatus.repository';
import { Status } from '../../domain/entities/status.entity';
import type { StatusType } from '../../domain/entities/status.entity';

@CommandHandler(CreateStatusCommand)
export class CreateStatusHandler implements ICommandHandler<CreateStatusCommand> {
  constructor(
    @Inject(STATUS_REPOSITORY) private readonly statuses: IStatusRepository,
  ) {}

  async execute(cmd: CreateStatusCommand): Promise<StatusView> {
    const position = await this.statuses.nextPosition(cmd.projectId);
    const status = Status.create(
      cmd.name,
      cmd.color,
      cmd.type as StatusType,
      cmd.projectId,
      position,
    );
    await this.statuses.save(status);
    return {
      id: status.id,
      projectId: status.projectId,
      name: status.name,
      color: status.color,
      type: status.type,
      position: status.position,
    };
  }
}
