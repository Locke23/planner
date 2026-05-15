import type { IssueFilters } from '../../domain/repositories/iissue.repository';

export class ListIssuesQuery {
  constructor(
    public readonly projectId: string,
    public readonly filters?: IssueFilters,
  ) {}
}
