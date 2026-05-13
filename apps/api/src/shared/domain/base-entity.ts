export abstract class BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  private _updatedAt: Date;

  get updatedAt(): Date { return this._updatedAt; }

  protected setUpdatedAt(date: Date): void { this._updatedAt = date; }

  protected constructor(id: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.createdAt = createdAt;
    this._updatedAt = updatedAt;
  }
}
