export class GetProjectQuery {
  constructor(
    readonly projectId: string,
    readonly workspaceId: string,
  ) {}
}
