import { randomUUID } from 'crypto';
import { BaseAggregate } from '../../../../shared/domain/base-aggregate';
import { WorkspaceSlug } from '../value-objects/workspace-slug.vo';
import { Member } from './member.entity';
import { MemberJoinedEvent } from '../events/member-joined.event';
import { MemberRemovedEvent } from '../events/member-removed.event';
import { MemberNotFoundException } from '../exceptions/member-not-found.exception';
import { InsufficientPermissionsException } from '../exceptions/insufficient-permissions.exception';

const CAN_MANAGE_MEMBERS = new Set(['OWNER', 'ADMIN']);
const CAN_CHANGE_ROLE = new Set(['OWNER']);

export interface ReconstitutedWorkspaceProps {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  members?: Member[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Workspace extends BaseAggregate {
  private _slug: WorkspaceSlug;
  private _name: string;
  private _ownerId: string;
  private _members: Member[];

  private constructor(props: ReconstitutedWorkspaceProps) {
    const now = new Date();
    super(props.id, props.createdAt ?? now, props.updatedAt ?? now);
    this._slug = new WorkspaceSlug(props.slug);
    this._name = props.name;
    this._ownerId = props.ownerId;
    this._members = props.members ? [...props.members] : [];
  }

  static create(name: string, slug: string, ownerId: string): Workspace {
    const ws = new Workspace({ id: randomUUID(), name: name.trim(), slug, ownerId });
    ws._members = [new Member(ownerId, ws.id, 'OWNER')];
    ws.addDomainEvent(new MemberJoinedEvent(ws.id, ownerId, 'OWNER'));
    return ws;
  }

  static reconstitute(props: ReconstitutedWorkspaceProps): Workspace {
    return new Workspace(props);
  }

  get slug(): WorkspaceSlug  { return this._slug; }
  get name(): string         { return this._name; }
  get ownerId(): string      { return this._ownerId; }
  get members(): Member[]    { return [...this._members]; }

  getMember(userId: string): Member | null {
    return this._members.find(m => m.userId === userId) ?? null;
  }

  hasMember(userId: string): boolean { return !!this.getMember(userId); }

  addMemberDirectly(userId: string, role: string): Member {
    const existing = this.getMember(userId);
    if (existing) return existing;
    const member = new Member(userId, this.id, role);
    this._members.push(member);
    this.setUpdatedAt(new Date());
    this.addDomainEvent(new MemberJoinedEvent(this.id, userId, role));
    return member;
  }

  removeMember(userId: string, actorId: string): void {
    const actor = this.getMember(actorId);
    if (!actor || !CAN_MANAGE_MEMBERS.has(actor.role)) throw new InsufficientPermissionsException();
    const idx = this._members.findIndex(m => m.userId === userId);
    if (idx === -1) throw new MemberNotFoundException();
    this._members.splice(idx, 1);
    this.setUpdatedAt(new Date());
    this.addDomainEvent(new MemberRemovedEvent(this.id, userId));
  }

  changeMemberRole(userId: string, newRole: string, actorId: string): void {
    const actor = this.getMember(actorId);
    if (!actor || !CAN_CHANGE_ROLE.has(actor.role)) throw new InsufficientPermissionsException();
    const member = this.getMember(userId);
    if (!member) throw new MemberNotFoundException();
    member.changeRole(newRole);
    this.setUpdatedAt(new Date());
  }

  rename(name: string, actorId: string): void {
    const actor = this.getMember(actorId);
    if (!actor || !CAN_MANAGE_MEMBERS.has(actor.role)) throw new InsufficientPermissionsException();
    this._name = name.trim();
    this.setUpdatedAt(new Date());
  }
}
