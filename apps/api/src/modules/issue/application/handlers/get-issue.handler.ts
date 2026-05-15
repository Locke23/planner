import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetIssueQuery, GetIssueByNumberQuery } from '../queries/get-issue.query';
import { ISSUE_REPOSITORY } from '../../domain/repositories/iissue.repository';
import type { IIssueRepository, IssueView } from '../../domain/repositories/iissue.repository';
import { IssueNotFoundException } from '../../domain/exceptions/issue-not-found.exception';

@QueryHandler(GetIssueQuery)
export class GetIssueHandler implements IQueryHandler<GetIssueQuery> {
  constructor(@Inject(ISSUE_REPOSITORY) private readonly issues: IIssueRepository) {}

  async execute(query: GetIssueQuery): Promise<IssueView> {
    const view = await this.issues.findView(query.issueId);
    if (!view) throw new IssueNotFoundException();
    return view;
  }
}

@QueryHandler(GetIssueByNumberQuery)
export class GetIssueByNumberHandler implements IQueryHandler<GetIssueByNumberQuery> {
  constructor(@Inject(ISSUE_REPOSITORY) private readonly issues: IIssueRepository) {}

  async execute(query: GetIssueByNumberQuery): Promise<IssueView> {
    const view = await this.issues.findViewByNumber(query.projectId, query.number);
    if (!view) throw new IssueNotFoundException();
    return view;
  }
}
