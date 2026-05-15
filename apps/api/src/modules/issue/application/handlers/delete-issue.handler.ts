import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteIssueCommand } from '../commands/delete-issue.command';
import { ISSUE_REPOSITORY } from '../../domain/repositories/iissue.repository';
import type { IIssueRepository } from '../../domain/repositories/iissue.repository';
import { IssueNotFoundException } from '../../domain/exceptions/issue-not-found.exception';

@CommandHandler(DeleteIssueCommand)
export class DeleteIssueHandler implements ICommandHandler<DeleteIssueCommand> {
  constructor(@Inject(ISSUE_REPOSITORY) private readonly issues: IIssueRepository) {}

  async execute(cmd: DeleteIssueCommand): Promise<void> {
    const issue = await this.issues.findById(cmd.issueId);
    if (!issue) throw new IssueNotFoundException();
    await this.issues.delete(cmd.issueId);
  }
}
