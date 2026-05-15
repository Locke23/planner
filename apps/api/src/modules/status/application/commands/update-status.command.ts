export class UpdateStatusCommand {
  constructor(
    public readonly statusId: string,
    public readonly projectId: string,
    public readonly name?: string,
    public readonly color?: string,
  ) {}
}
