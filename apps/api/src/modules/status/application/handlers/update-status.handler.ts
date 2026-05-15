import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateStatusCommand } from '../commands/update-status.command';
import { STATUS_REPOSITORY } from '../../domain/repositories/istatus.repository';
import type { IStatusRepository } from '../../domain/repositories/istatus.repository';
import { StatusNotFoundException } from '../../domain/exceptions/status-not-found.exception';

@CommandHandler(UpdateStatusCommand)
export class UpdateStatusHandler implements ICommandHandler<UpdateStatusCommand> {
  constructor(
    @Inject(STATUS_REPOSITORY) private readonly statuses: IStatusRepository,
  ) {}

  async execute(cmd: UpdateStatusCommand): Promise<void> {
    const status = await this.statuses.findById(cmd.statusId);
    if (!status || status.projectId !== cmd.projectId) {
      throw new StatusNotFoundException();
    }
    status.update(cmd.name, cmd.color);
    await this.statuses.save(status);
  }
}
