import { Module } from '@nestjs/common';
import { PROJECT_REPOSITORY } from './domain/repositories/iproject.repository';
import { PrismaProjectRepository } from './infra/persistence/prisma-project.repository';
import { CreateProjectHandler } from './application/handlers/create-project.handler';
import { UpdateProjectHandler } from './application/handlers/update-project.handler';
import { DeleteProjectHandler } from './application/handlers/delete-project.handler';
import { GetProjectHandler } from './application/handlers/get-project.handler';
import { ListProjectsHandler } from './application/handlers/list-projects.handler';
import { ProjectController } from './presentation/controllers/project.controller';
import { IdentityModule } from '../identity/identity.module';
import { StatusModule } from '../status/status.module';

const COMMAND_HANDLERS = [CreateProjectHandler, UpdateProjectHandler, DeleteProjectHandler];
const QUERY_HANDLERS = [GetProjectHandler, ListProjectsHandler];

@Module({
  imports: [IdentityModule, StatusModule],
  controllers: [ProjectController],
  providers: [
    { provide: PROJECT_REPOSITORY, useClass: PrismaProjectRepository },
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
  ],
})
export class ProjectModule {}
