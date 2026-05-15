export class DeleteIssueCommand {
  constructor(
    public readonly issueId: string,
    public readonly projectId: string,
  ) {}
}
