export class ReorderStatusesCommand {
  constructor(
    public readonly projectId: string,
    public readonly orderedIds: string[],
  ) {}
}
