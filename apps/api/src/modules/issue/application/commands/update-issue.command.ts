export class UpdateIssueCommand {
  constructor(
    public readonly issueId: string,
    public readonly projectId: string,
    public readonly title?: string,
    public readonly description?: string,
    public readonly statusId?: string,
    public readonly assigneeId?: string | null,
    public readonly priority?: string,
    public readonly labelIds?: string[],
  ) {}
}
