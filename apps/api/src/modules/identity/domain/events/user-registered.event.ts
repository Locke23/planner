import type { IDomainEvent } from '../../../../shared/domain/domain-event';

export class UserRegisteredEvent implements IDomainEvent {
  readonly type = 'UserRegistered';
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly email: string,
  ) {}
}
