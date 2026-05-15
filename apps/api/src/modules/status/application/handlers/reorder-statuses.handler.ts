import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReorderStatusesCommand } from '../commands/reorder-statuses.command';
import { STATUS_REPOSITORY } from '../../domain/repositories/istatus.repository';
import type { IStatusRepository } from '../../domain/repositories/istatus.repository';
import { StatusNotFoundException } from '../../domain/exceptions/status-not-found.exception';
import type { Status } from '../../domain/entities/status.entity';

@CommandHandler(ReorderStatusesCommand)
export class ReorderStatusesHandler implements ICommandHandler<ReorderStatusesCommand> {
  constructor(
    @Inject(STATUS_REPOSITORY) private readonly statuses: IStatusRepository,
  ) {}

  async execute(cmd: ReorderStatusesCommand): Promise<void> {
    const views = await this.statuses.findByProject(cmd.projectId);
    const viewMap = new Map(views.map(v => [v.id, v]));

    const reordered: Status[] = [];
    for (let i = 0; i < cmd.orderedIds.length; i++) {
      const id = cmd.orderedIds[i];
      if (!viewMap.has(id)) throw new StatusNotFoundException();
      const entity = await this.statuses.findById(id);
      if (!entity || entity.projectId !== cmd.projectId) throw new StatusNotFoundException();
      entity.setPosition(i);
      reordered.push(entity);
    }

    await this.statuses.saveMany(reordered);
  }
}
