import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Domain
import { USER_REPOSITORY } from './domain/repositories/iuser.repository';
import { WORKSPACE_REPOSITORY } from './domain/repositories/iworkspace.repository';
import { INVITATION_REPOSITORY } from './domain/repositories/iinvitation.repository';

// Infrastructure
import { PrismaUserRepository } from './infra/persistence/prisma-user.repository';
import { PrismaWorkspaceRepository } from './infra/persistence/prisma-workspace.repository';
import { PrismaInvitationRepository } from './infra/persistence/prisma-invitation.repository';
import { AuthService } from './infra/auth/auth.service';
import { JwtStrategy } from './infra/auth/jwt.strategy';
import { RedisTokenService, REDIS_CLIENT } from './infra/auth/redis-token.service';

// Application handlers
import { RegisterUserHandler } from './application/handlers/register-user.handler';
import { CreateWorkspaceHandler } from './application/handlers/create-workspace.handler';
import { InviteMemberHandler } from './application/handlers/invite-member.handler';
import { AcceptInvitationHandler } from './application/handlers/accept-invitation.handler';
import { RemoveMemberHandler } from './application/handlers/remove-member.handler';
import { ChangeMemberRoleHandler } from './application/handlers/change-member-role.handler';
import { GetCurrentUserHandler } from './application/handlers/get-current-user.handler';
import { GetWorkspaceHandler } from './application/handlers/get-workspace.handler';
import { GetWorkspaceMembersHandler } from './application/handlers/get-workspace-members.handler';
import { ListWorkspacesHandler } from './application/handlers/list-workspaces.handler';

// Presentation
import { AuthController } from './presentation/controllers/auth.controller';
import { WorkspaceController } from './presentation/controllers/workspace.controller';
import { WorkspaceRoleGuard } from './presentation/guards/workspace-role.guard';

import Redis from 'ioredis';

const COMMAND_HANDLERS = [
  RegisterUserHandler,
  CreateWorkspaceHandler,
  InviteMemberHandler,
  AcceptInvitationHandler,
  RemoveMemberHandler,
  ChangeMemberRoleHandler,
];

const QUERY_HANDLERS = [
  GetCurrentUserHandler,
  GetWorkspaceHandler,
  GetWorkspaceMembersHandler,
  ListWorkspacesHandler,
];

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController, WorkspaceController],
  providers: [
    // Repositories
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: WORKSPACE_REPOSITORY, useClass: PrismaWorkspaceRepository },
    { provide: INVITATION_REPOSITORY, useClass: PrismaInvitationRepository },

    // Redis client
    {
      provide: REDIS_CLIENT,
      useFactory: (config: ConfigService) =>
        new Redis(config.getOrThrow<string>('REDIS_URL')),
      inject: [ConfigService],
    },

    // Auth
    AuthService,
    JwtStrategy,
    RedisTokenService,
    WorkspaceRoleGuard,

    // Handlers
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
  ],
  exports: [AuthService, USER_REPOSITORY, WORKSPACE_REPOSITORY],
})
export class IdentityModule {}
