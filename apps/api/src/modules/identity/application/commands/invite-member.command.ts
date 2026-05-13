export class InviteMemberCommand {
  constructor(
    readonly workspaceId: string,
    readonly email: string,
    readonly role: string,
    readonly actorId: string,
  ) {}
}
