import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infra/prisma.service';
import type { IIssueRepository, IssueFilters, IssueView } from '../../domain/repositories/iissue.repository';
import { Issue } from '../../domain/entities/issue.entity';
import type { Priority } from '../../domain/entities/issue.entity';

type IssueRow = Prisma.IssueGetPayload<{
  include: {
    labels: true;
    project: { select: { identifier: true } };
  };
}>;

@Injectable()
export class PrismaIssueRepository implements IIssueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Issue | null> {
    const row = await this.prisma.issue.findUnique({
      where: { id },
      include: { labels: true, project: { select: { identifier: true } } },
    });
    return row ? this.toEntity(row) : null;
  }

  async findByNumber(projectId: string, number: number): Promise<Issue | null> {
    const row = await this.prisma.issue.findUnique({
      where: { projectId_number: { projectId, number } },
      include: { labels: true, project: { select: { identifier: true } } },
    });
    return row ? this.toEntity(row) : null;
  }

  async findView(id: string): Promise<IssueView | null> {
    const row = await this.prisma.issue.findUnique({
      where: { id },
      include: { labels: true, project: { select: { identifier: true } } },
    });
    return row ? this.toView(row) : null;
  }

  async findViewByNumber(projectId: string, number: number): Promise<IssueView | null> {
    const row = await this.prisma.issue.findUnique({
      where: { projectId_number: { projectId, number } },
      include: { labels: true, project: { select: { identifier: true } } },
    });
    return row ? this.toView(row) : null;
  }

  async findByProject(projectId: string, filters?: IssueFilters): Promise<IssueView[]> {
    const where: Prisma.IssueWhereInput = { projectId };

    if (filters?.status) {
      where.statusId = filters.status;
    }
    if (filters?.assignee) {
      where.assigneeId = filters.assignee;
    }
    if (filters?.priority) {
      const priorities = filters.priority.split(',').map(p => p.trim()) as Priority[];
      where.priority = { in: priorities };
    }
    if (filters?.label) {
      where.labels = { some: { labelId: filters.label } };
    }
    if (filters?.q) {
      where.title = { contains: filters.q, mode: 'insensitive' };
    }

    const rows = await this.prisma.issue.findMany({
      where,
      include: { labels: true, project: { select: { identifier: true } } },
      orderBy: { number: 'asc' },
    });

    return rows.map(r => this.toView(r));
  }

  async create(issue: Issue, labelIds: string[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.issue.create({
        data: {
          id: issue.id,
          projectId: issue.projectId,
          workspaceId: issue.workspaceId,
          number: issue.number,
          title: issue.title,
          description: issue.description,
          statusId: issue.statusId,
          assigneeId: issue.assigneeId,
          priority: issue.priority,
          createdBy: issue.createdBy,
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
        },
      });

      if (labelIds.length > 0) {
        await tx.issueLabel.createMany({
          data: labelIds.map(labelId => ({ issueId: issue.id, labelId })),
        });
      }
    });
  }

  async save(issue: Issue, labelIds?: string[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.issue.update({
        where: { id: issue.id },
        data: {
          title: issue.title,
          description: issue.description,
          statusId: issue.statusId,
          assigneeId: issue.assigneeId,
          priority: issue.priority,
          updatedAt: issue.updatedAt,
        },
      });

      if (labelIds !== undefined) {
        await tx.issueLabel.deleteMany({ where: { issueId: issue.id } });
        if (labelIds.length > 0) {
          await tx.issueLabel.createMany({
            data: labelIds.map(labelId => ({ issueId: issue.id, labelId })),
          });
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.issue.delete({ where: { id } });
  }

  async nextNumber(projectId: string): Promise<number> {
    const result = await this.prisma.issue.aggregate({
      where: { projectId },
      _max: { number: true },
    });
    return (result._max.number ?? 0) + 1;
  }

  private toEntity(row: IssueRow): Issue {
    return Issue.reconstitute({
      id: row.id,
      projectId: row.projectId,
      workspaceId: row.workspaceId,
      number: row.number,
      title: row.title,
      description: row.description ?? null,
      statusId: row.statusId,
      assigneeId: row.assigneeId ?? null,
      priority: row.priority as Priority,
      labelIds: row.labels.map(l => l.labelId),
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toView(row: IssueRow): IssueView {
    return {
      id: row.id,
      projectId: row.projectId,
      workspaceId: row.workspaceId,
      number: row.number,
      identifier: `${row.project.identifier}-${row.number}`,
      title: row.title,
      description: row.description ?? null,
      statusId: row.statusId,
      assigneeId: row.assigneeId ?? null,
      priority: row.priority,
      labelIds: row.labels.map(l => l.labelId),
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
