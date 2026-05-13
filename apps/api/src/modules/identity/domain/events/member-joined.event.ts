import type { IDomainEvent } from '../../../../shared/domain/domain-event';

export class MemberJoinedEvent implements IDomainEvent {
  readonly type = 'MemberJoined';
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly userId: string,
    readonly role: string,
  ) {}
}
