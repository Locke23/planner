export class CreateStatusCommand {
  constructor(
    public readonly projectId: string,
    public readonly name: string,
    public readonly color: string,
    public readonly type: string,
  ) {}
}
