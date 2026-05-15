import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateIssueCommand } from '../commands/update-issue.command';
import { ISSUE_REPOSITORY } from '../../domain/repositories/iissue.repository';
import type { IIssueRepository } from '../../domain/repositories/iissue.repository';
import type { Priority } from '../../domain/entities/issue.entity';
import { IssueNotFoundException } from '../../domain/exceptions/issue-not-found.exception';

@CommandHandler(UpdateIssueCommand)
export class UpdateIssueHandler implements ICommandHandler<UpdateIssueCommand> {
  constructor(@Inject(ISSUE_REPOSITORY) private readonly issues: IIssueRepository) {}

  async execute(cmd: UpdateIssueCommand): Promise<void> {
    const issue = await this.issues.findById(cmd.issueId);
    if (!issue) throw new IssueNotFoundException();

    issue.update({
      title: cmd.title,
      description: cmd.description,
      statusId: cmd.statusId,
      assigneeId: cmd.assigneeId,
      priority: cmd.priority as Priority | undefined,
      labelIds: cmd.labelIds,
    });

    await this.issues.save(issue, cmd.labelIds);
  }
}
