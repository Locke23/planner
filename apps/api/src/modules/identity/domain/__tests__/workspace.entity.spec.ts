import { Workspace } from '../entities/workspace.entity';
import { MemberJoinedEvent } from '../events/member-joined.event';
import { InsufficientPermissionsException } from '../exceptions/insufficient-permissions.exception';
import { MemberNotFoundException } from '../exceptions/member-not-found.exception';

describe('Workspace', () => {
  const ownerId = 'owner-uuid';
  let ws: Workspace;

  beforeEach(() => { ws = Workspace.create('My Workspace', 'my-workspace', ownerId); });

  describe('create', () => {
    it('adds owner as OWNER member', () => {
      expect(ws.getMember(ownerId)?.role).toBe('OWNER');
    });

    it('raises MemberJoinedEvent for owner', () => {
      const event = ws.domainEvents.find(e => e.type === 'MemberJoined') as MemberJoinedEvent;
      expect(event).toBeDefined();
      expect(event.userId).toBe(ownerId);
    });

    it('throws for bad slug', () => {
      expect(() => Workspace.create('W', 'A', ownerId)).toThrow();
    });
  });

  describe('addMemberDirectly', () => {
    it('adds a new member', () => {
      ws.addMemberDirectly('user-2', 'MEMBER');
      expect(ws.hasMember('user-2')).toBe(true);
    });

    it('updates role if member already exists', () => {
      ws.addMemberDirectly('user-2', 'MEMBER');
      ws.addMemberDirectly('user-2', 'ADMIN');
      expect(ws.getMember('user-2')!.role).toBe('ADMIN');
    });
  });

  describe('removeMember', () => {
    it('removes member when actor is OWNER', () => {
      ws.addMemberDirectly('user-2', 'MEMBER');
      ws.removeMember('user-2', ownerId);
      expect(ws.hasMember('user-2')).toBe(false);
    });

    it('throws InsufficientPermissionsException when actor is MEMBER', () => {
      ws.addMemberDirectly('user-2', 'MEMBER');
      ws.addMemberDirectly('user-3', 'MEMBER');
      expect(() => ws.removeMember('user-3', 'user-2')).toThrow(InsufficientPermissionsException);
    });

    it('throws MemberNotFoundException for unknown member', () => {
      expect(() => ws.removeMember('ghost', ownerId)).toThrow(MemberNotFoundException);
    });
  });
});
