import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { CreateIssueCommand } from '../commands/create-issue.command';
import { ISSUE_REPOSITORY } from '../../domain/repositories/iissue.repository';
import type { IIssueRepository } from '../../domain/repositories/iissue.repository';
import { STATUS_REPOSITORY } from '../../../status/domain/repositories/istatus.repository';
import type { IStatusRepository } from '../../../status/domain/repositories/istatus.repository';
import { Issue } from '../../domain/entities/issue.entity';
import type { Priority } from '../../domain/entities/issue.entity';

@CommandHandler(CreateIssueCommand)
export class CreateIssueHandler implements ICommandHandler<CreateIssueCommand> {
  constructor(
    @Inject(ISSUE_REPOSITORY) private readonly issues: IIssueRepository,
    @Inject(STATUS_REPOSITORY) private readonly statuses: IStatusRepository,
  ) {}

  async execute(cmd: CreateIssueCommand): Promise<string> {
    let statusId = cmd.statusId;
    if (!statusId) {
      const projectStatuses = await this.statuses.findByProject(cmd.projectId);
      const backlog = projectStatuses.find((s) => s.type === 'BACKLOG');
      if (!backlog) throw new BadRequestException('Project has no Backlog status');
      statusId = backlog.id;
    }

    const number = await this.issues.nextNumber(cmd.projectId);
    const issue = Issue.create(
      cmd.title,
      statusId,
      cmd.projectId,
      cmd.workspaceId,
      cmd.createdBy,
      number,
      {
        description: cmd.description,
        assigneeId: cmd.assigneeId,
        priority: cmd.priority as Priority | undefined,
        labelIds: cmd.labelIds,
      },
    );
    await this.issues.create(issue, cmd.labelIds ?? []);
    return issue.id;
  }
}
