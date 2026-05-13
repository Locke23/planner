export class AcceptInvitationCommand {
  constructor(
    readonly token: string,
    readonly userId: string,
  ) {}
}
