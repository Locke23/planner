import { randomUUID } from 'crypto';
import { BaseAggregate } from '../../../../shared/domain/base-aggregate';

export type StatusType = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export class Status extends BaseAggregate {
  private _projectId: string;
  private _name: string;
  private _color: string;
  private _type: StatusType;
  private _position: number;

  private constructor(props: {
    id: string;
    projectId: string;
    name: string;
    color: string;
    type: StatusType;
    position: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    const now = new Date();
    super(props.id, props.createdAt ?? now, props.updatedAt ?? now);
    this._projectId = props.projectId;
    this._name = props.name;
    this._color = props.color;
    this._type = props.type;
    this._position = props.position;
  }

  static create(
    name: string,
    color: string,
    type: StatusType,
    projectId: string,
    position: number,
  ): Status {
    return new Status({ id: randomUUID(), projectId, name, color, type, position });
  }

  static reconstitute(props: {
    id: string;
    projectId: string;
    name: string;
    color: string;
    type: StatusType;
    position: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Status {
    return new Status(props);
  }

  get projectId(): string {
    return this._projectId;
  }

  get name(): string {
    return this._name;
  }

  get color(): string {
    return this._color;
  }

  get type(): StatusType {
    return this._type;
  }

  get position(): number {
    return this._position;
  }

  update(name?: string, color?: string): void {
    if (name !== undefined) this._name = name.trim();
    if (color !== undefined) this._color = color;
    this.setUpdatedAt(new Date());
  }

  setPosition(position: number): void {
    this._position = position;
    this.setUpdatedAt(new Date());
  }
}
