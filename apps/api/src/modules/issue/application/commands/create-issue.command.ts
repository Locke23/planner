export class CreateIssueCommand {
  constructor(
    public readonly projectId: string,
    public readonly workspaceId: string,
    public readonly createdBy: string,
    public readonly title: string,
    public readonly statusId: string | undefined,
    public readonly description?: string,
    public readonly assigneeId?: string,
    public readonly priority?: string,
    public readonly labelIds?: string[],
  ) {}
}
