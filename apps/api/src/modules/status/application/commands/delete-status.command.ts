export class DeleteStatusCommand {
  constructor(
    public readonly statusId: string,
    public readonly projectId: string,
  ) {}
}
