export class Member {
  private _role: string;

  constructor(
    readonly userId: string,
    readonly workspaceId: string,
    role: string,
    readonly joinedAt: Date = new Date(),
  ) {
    this._role = role;
  }

  get role(): string { return this._role; }

  changeRole(newRole: string): void {
    this._role = newRole;
  }
}
