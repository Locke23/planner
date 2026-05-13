export class GetWorkspaceMembersQuery {
  constructor(readonly workspaceId: string, readonly requesterId: string) {}
}
