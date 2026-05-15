import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListIssuesQuery } from '../queries/list-issues.query';
import { ISSUE_REPOSITORY } from '../../domain/repositories/iissue.repository';
import type { IIssueRepository, IssueView } from '../../domain/repositories/iissue.repository';

@QueryHandler(ListIssuesQuery)
export class ListIssuesHandler implements IQueryHandler<ListIssuesQuery> {
  constructor(@Inject(ISSUE_REPOSITORY) private readonly issues: IIssueRepository) {}

  async execute(query: ListIssuesQuery): Promise<IssueView[]> {
    return this.issues.findByProject(query.projectId, query.filters);
  }
}
