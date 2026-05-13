import type { IDomainEvent } from '../../../../shared/domain/domain-event';

export class MemberRemovedEvent implements IDomainEvent {
  readonly type = 'MemberRemoved';
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly userId: string,
  ) {}
}
