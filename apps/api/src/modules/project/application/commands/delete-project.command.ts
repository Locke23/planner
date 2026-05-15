export class DeleteProjectCommand {
  constructor(
    readonly projectId: string,
    readonly workspaceId: string,
  ) {}
}
