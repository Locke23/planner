export class WorkspaceId {
  constructor(readonly value: string) {
    if (!value) throw new Error('WorkspaceId cannot be empty');
  }
  equals(other: WorkspaceId): boolean { return this.value === other.value; }
  toString(): string { return this.value; }
}
