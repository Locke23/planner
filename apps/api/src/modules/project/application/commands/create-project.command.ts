export class CreateProjectCommand {
  constructor(
    readonly name: string,
    readonly identifier: string,
    readonly workspaceId: string,
    readonly description?: string,
  ) {}
}
