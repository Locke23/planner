import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infra/prisma.service';
import type { IProjectRepository, ProjectView } from '../../domain/repositories/iproject.repository';
import { Project } from '../../domain/entities/project.entity';

type ProjectRow = Prisma.ProjectGetPayload<{
  include: { statuses: true; labels: true; _count: { select: { issues: true } } };
}>;

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({ where: { id } });
    return row ? Project.reconstitute({ ...row, description: row.description ?? null }) : null;
  }

  async findViewById(id: string, workspaceId: string): Promise<ProjectView | null> {
    const row = await this.prisma.project.findFirst({
      where: { id, workspaceId },
      include: { statuses: { orderBy: { position: 'asc' } }, labels: true, _count: { select: { issues: true } } },
    });
    return row ? this.toView(row) : null;
  }

  async findByWorkspace(workspaceId: string): Promise<ProjectView[]> {
    const rows = await this.prisma.project.findMany({
      where: { workspaceId },
      include: { statuses: { orderBy: { position: 'asc' } }, labels: true, _count: { select: { issues: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(r => this.toView(r));
  }

  async findByIdentifier(workspaceId: string, identifier: string): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({
      where: { workspaceId_identifier: { workspaceId, identifier } },
    });
    return row ? Project.reconstitute({ ...row, description: row.description ?? null }) : null;
  }

  async save(project: Project): Promise<void> {
    await this.prisma.project.upsert({
      where: { id: project.id },
      create: {
        id: project.id,
        workspaceId: project.workspaceId,
        name: project.name,
        description: project.description,
        identifier: project.identifier,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      update: {
        name: project.name,
        description: project.description,
        updatedAt: project.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }

  private toView(row: ProjectRow): ProjectView {
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      name: row.name,
      description: row.description ?? null,
      identifier: row.identifier,
      statuses: row.statuses.map(s => ({
        id: s.id,
        projectId: s.projectId,
        name: s.name,
        color: s.color,
        type: s.type,
        position: s.position,
      })),
      labels: row.labels.map(l => ({
        id: l.id,
        projectId: l.projectId,
        name: l.name,
        color: l.color,
      })),
      issueCount: row._count.issues,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
