import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListStatusesQuery } from '../queries/list-statuses.query';
import { STATUS_REPOSITORY } from '../../domain/repositories/istatus.repository';
import type { IStatusRepository, StatusView } from '../../domain/repositories/istatus.repository';

@QueryHandler(ListStatusesQuery)
export class ListStatusesHandler implements IQueryHandler<ListStatusesQuery> {
  constructor(
    @Inject(STATUS_REPOSITORY) private readonly statuses: IStatusRepository,
  ) {}

  async execute(query: ListStatusesQuery): Promise<StatusView[]> {
    return this.statuses.findByProject(query.projectId);
  }
}
