export class ChangeMemberRoleCommand {
  constructor(
    readonly workspaceId: string,
    readonly targetUserId: string,
    readonly newRole: string,
    readonly actorId: string,
  ) {}
}
