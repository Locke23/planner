export class UpdateProjectCommand {
  constructor(
    readonly projectId: string,
    readonly workspaceId: string,
    readonly name?: string,
    readonly description?: string,
  ) {}
}
