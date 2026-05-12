import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { IDomainEvent } from '../domain/domain-event';
import { BaseAggregate } from '../domain/base-aggregate';

@Injectable()
export class EventBusService {
  constructor(private readonly eventBus: EventBus) {}

  publishAll(aggregate: BaseAggregate): void {
    const events = aggregate.domainEvents;
    aggregate.clearDomainEvents();
    for (const event of events) {
      this.eventBus.publish(event);
    }
  }
}
