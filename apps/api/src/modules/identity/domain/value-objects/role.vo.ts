export enum RoleValue {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export class Role {
  static readonly OWNER = new Role(RoleValue.OWNER);
  static readonly ADMIN = new Role(RoleValue.ADMIN);
  static readonly MEMBER = new Role(RoleValue.MEMBER);

  private constructor(readonly value: RoleValue) {}

  static from(value: string): Role {
    switch (value) {
      case RoleValue.OWNER:  return Role.OWNER;
      case RoleValue.ADMIN:  return Role.ADMIN;
      case RoleValue.MEMBER: return Role.MEMBER;
      default: throw new Error(`Unknown role: ${value}`);
    }
  }

  canManageMembers(): boolean  { return this.value !== RoleValue.MEMBER; }
  canDeleteWorkspace(): boolean { return this.value === RoleValue.OWNER; }
  canManageProjects(): boolean  { return this.value !== RoleValue.MEMBER; }
  canChangeMemberRole(): boolean { return this.value === RoleValue.OWNER; }

  equals(other: Role): boolean { return this.value === other.value; }
  toString(): string { return this.value; }
}
