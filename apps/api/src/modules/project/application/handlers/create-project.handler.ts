import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateProjectCommand } from '../commands/create-project.command';
import { PROJECT_REPOSITORY } from '../../domain/repositories/iproject.repository';
import type { IProjectRepository } from '../../domain/repositories/iproject.repository';
import { Project } from '../../domain/entities/project.entity';
import { ProjectIdentifierTakenException } from '../../domain/exceptions/project-identifier-taken.exception';
import { STATUS_REPOSITORY } from '../../../status/domain/repositories/istatus.repository';
import type { IStatusRepository } from '../../../status/domain/repositories/istatus.repository';
import { Status } from '../../../status/domain/entities/status.entity';

const DEFAULT_STATUSES: Array<{ name: string; color: string; type: Parameters<typeof Status.create>[2] }> = [
  { name: 'Backlog',     color: '#6B7280', type: 'BACKLOG'     },
  { name: 'Todo',        color: '#3B82F6', type: 'TODO'        },
  { name: 'In Progress', color: '#F59E0B', type: 'IN_PROGRESS' },
  { name: 'Done',        color: '#10B981', type: 'DONE'        },
  { name: 'Cancelled',   color: '#EF4444', type: 'CANCELLED'   },
];

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand> {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projects: IProjectRepository,
    @Inject(STATUS_REPOSITORY) private readonly statuses: IStatusRepository,
  ) {}

  async execute(cmd: CreateProjectCommand): Promise<Project> {
    const existing = await this.projects.findByIdentifier(cmd.workspaceId, cmd.identifier.toUpperCase());
    if (existing) throw new ProjectIdentifierTakenException();

    const project = Project.create(cmd.name, cmd.identifier, cmd.workspaceId, cmd.description);
    await this.projects.save(project);

    const defaultStatuses = DEFAULT_STATUSES.map((s, i) =>
      Status.create(s.name, s.color, s.type, project.id, i),
    );
    await this.statuses.saveMany(defaultStatuses);

    return project;
  }
}
