import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from './infra/prisma.service';
import { EventBusService } from './infra/event-bus.service';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [PrismaService, EventBusService],
  exports: [PrismaService, EventBusService, CqrsModule],
})
export class SharedModule {}
