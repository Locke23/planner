export class RemoveMemberCommand {
  constructor(
    readonly workspaceId: string,
    readonly targetUserId: string,
    readonly actorId: string,
  ) {}
}
