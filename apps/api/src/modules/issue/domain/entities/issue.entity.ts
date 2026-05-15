import { randomUUID } from 'crypto';
import { BaseAggregate } from '../../../../shared/domain/base-aggregate';

export type Priority = 'NO_PRIORITY' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ReconstitutedIssueProps {
  id: string;
  projectId: string;
  workspaceId: string;
  number: number;
  title: string;
  description: string | null;
  statusId: string;
  assigneeId: string | null;
  priority: Priority;
  labelIds: string[];
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Issue extends BaseAggregate {
  private _projectId: string;
  private _workspaceId: string;
  private _number: number;
  private _title: string;
  private _description: string | null;
  private _statusId: string;
  private _assigneeId: string | null;
  private _priority: Priority;
  private _labelIds: string[];
  private _createdBy: string;

  private constructor(props: ReconstitutedIssueProps) {
    const now = new Date();
    super(props.id, props.createdAt ?? now, props.updatedAt ?? now);
    this._projectId = props.projectId;
    this._workspaceId = props.workspaceId;
    this._number = props.number;
    this._title = props.title;
    this._description = props.description;
    this._statusId = props.statusId;
    this._assigneeId = props.assigneeId;
    this._priority = props.priority;
    this._labelIds = props.labelIds;
    this._createdBy = props.createdBy;
  }

  static create(
    title: string,
    statusId: string,
    projectId: string,
    workspaceId: string,
    createdBy: string,
    number: number,
    opts?: {
      description?: string;
      assigneeId?: string;
      priority?: Priority;
      labelIds?: string[];
    },
  ): Issue {
    return new Issue({
      id: randomUUID(),
      projectId,
      workspaceId,
      number,
      title: title.trim(),
      description: opts?.description?.trim() ?? null,
      statusId,
      assigneeId: opts?.assigneeId ?? null,
      priority: opts?.priority ?? 'NO_PRIORITY',
      labelIds: opts?.labelIds ?? [],
      createdBy,
    });
  }

  static reconstitute(props: ReconstitutedIssueProps): Issue {
    return new Issue(props);
  }

  get projectId(): string        { return this._projectId; }
  get workspaceId(): string      { return this._workspaceId; }
  get number(): number           { return this._number; }
  get title(): string            { return this._title; }
  get description(): string | null { return this._description; }
  get statusId(): string         { return this._statusId; }
  get assigneeId(): string | null { return this._assigneeId; }
  get priority(): Priority       { return this._priority; }
  get labelIds(): string[]       { return this._labelIds; }
  get createdBy(): string        { return this._createdBy; }

  update(opts: {
    title?: string;
    description?: string;
    statusId?: string;
    assigneeId?: string | null;
    priority?: Priority;
    labelIds?: string[];
  }): void {
    if (opts.title !== undefined) this._title = opts.title.trim();
    if (opts.description !== undefined) this._description = opts.description.trim() || null;
    if (opts.statusId !== undefined) this._statusId = opts.statusId;
    if (opts.assigneeId !== undefined) this._assigneeId = opts.assigneeId;
    if (opts.priority !== undefined) this._priority = opts.priority;
    if (opts.labelIds !== undefined) this._labelIds = opts.labelIds;
    this.setUpdatedAt(new Date());
  }
}
