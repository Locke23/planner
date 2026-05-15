import { randomUUID } from 'crypto';
import { BaseAggregate } from '../../../../shared/domain/base-aggregate';

export interface ReconstitutedProjectProps {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  identifier: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Project extends BaseAggregate {
  private _workspaceId: string;
  private _name: string;
  private _description: string | null;
  private _identifier: string;

  private constructor(props: ReconstitutedProjectProps) {
    const now = new Date();
    super(props.id, props.createdAt ?? now, props.updatedAt ?? now);
    this._workspaceId = props.workspaceId;
    this._name = props.name;
    this._description = props.description;
    this._identifier = props.identifier;
  }

  static create(name: string, identifier: string, workspaceId: string, description?: string): Project {
    return new Project({
      id: randomUUID(),
      workspaceId,
      name: name.trim(),
      identifier: identifier.toUpperCase(),
      description: description?.trim() ?? null,
    });
  }

  static reconstitute(props: ReconstitutedProjectProps): Project {
    return new Project(props);
  }

  get workspaceId(): string        { return this._workspaceId; }
  get name(): string               { return this._name; }
  get description(): string | null { return this._description; }
  get identifier(): string         { return this._identifier; }

  update(name?: string, description?: string): void {
    if (name !== undefined) this._name = name.trim();
    if (description !== undefined) this._description = description.trim() || null;
    this.setUpdatedAt(new Date());
  }
}
