import { Module } from '@nestjs/common';
import { STATUS_REPOSITORY } from './domain/repositories/istatus.repository';
import { PrismaStatusRepository } from './infra/persistence/prisma-status.repository';
import { CreateStatusHandler } from './application/handlers/create-status.handler';
import { UpdateStatusHandler } from './application/handlers/update-status.handler';
import { DeleteStatusHandler } from './application/handlers/delete-status.handler';
import { ReorderStatusesHandler } from './application/handlers/reorder-statuses.handler';
import { ListStatusesHandler } from './application/handlers/list-statuses.handler';
import { StatusController } from './presentation/controllers/status.controller';
import { IdentityModule } from '../identity/identity.module';

const COMMAND_HANDLERS = [
  CreateStatusHandler,
  UpdateStatusHandler,
  DeleteStatusHandler,
  ReorderStatusesHandler,
];
const QUERY_HANDLERS = [ListStatusesHandler];

@Module({
  imports: [IdentityModule],
  controllers: [StatusController],
  providers: [
    { provide: STATUS_REPOSITORY, useClass: PrismaStatusRepository },
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
  ],
  exports: [STATUS_REPOSITORY],
})
export class StatusModule {}
