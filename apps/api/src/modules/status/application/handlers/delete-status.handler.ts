import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteStatusCommand } from '../commands/delete-status.command';
import { STATUS_REPOSITORY } from '../../domain/repositories/istatus.repository';
import type { IStatusRepository } from '../../domain/repositories/istatus.repository';
import { StatusNotFoundException } from '../../domain/exceptions/status-not-found.exception';

@CommandHandler(DeleteStatusCommand)
export class DeleteStatusHandler implements ICommandHandler<DeleteStatusCommand> {
  constructor(
    @Inject(STATUS_REPOSITORY) private readonly statuses: IStatusRepository,
  ) {}

  async execute(cmd: DeleteStatusCommand): Promise<void> {
    const status = await this.statuses.findById(cmd.statusId);
    if (!status || status.projectId !== cmd.projectId) {
      throw new StatusNotFoundException();
    }
    await this.statuses.delete(cmd.statusId);
  }
}
