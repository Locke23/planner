export class GetIssueQuery {
  constructor(
    public readonly issueId: string,
    public readonly projectId: string,
  ) {}
}

export class GetIssueByNumberQuery {
  constructor(
    public readonly projectId: string,
    public readonly number: number,
  ) {}
}
