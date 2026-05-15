import { Module } from '@nestjs/common';
import { ISSUE_REPOSITORY } from './domain/repositories/iissue.repository';
import { PrismaIssueRepository } from './infra/persistence/prisma-issue.repository';
import { CreateIssueHandler } from './application/handlers/create-issue.handler';
import { UpdateIssueHandler } from './application/handlers/update-issue.handler';
import { DeleteIssueHandler } from './application/handlers/delete-issue.handler';
import { GetIssueHandler, GetIssueByNumberHandler } from './application/handlers/get-issue.handler';
import { ListIssuesHandler } from './application/handlers/list-issues.handler';
import { IssueController } from './presentation/controllers/issue.controller';
import { IdentityModule } from '../identity/identity.module';
import { StatusModule } from '../status/status.module';

const COMMAND_HANDLERS = [CreateIssueHandler, UpdateIssueHandler, DeleteIssueHandler];
const QUERY_HANDLERS = [GetIssueHandler, GetIssueByNumberHandler, ListIssuesHandler];

@Module({
  imports: [IdentityModule, StatusModule],
  controllers: [IssueController],
  providers: [
    { provide: ISSUE_REPOSITORY, useClass: PrismaIssueRepository },
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
  ],
})
export class IssueModule {}
