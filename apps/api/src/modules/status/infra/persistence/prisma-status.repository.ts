import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infra/prisma.service';
import { IStatusRepository, StatusView } from '../../domain/repositories/istatus.repository';
import { Status } from '../../domain/entities/status.entity';
import type { StatusType } from '../../domain/entities/status.entity';

@Injectable()
export class PrismaStatusRepository implements IStatusRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Status | null> {
    const row = await this.prisma.status.findUnique({ where: { id } });
    if (!row) return null;
    return Status.reconstitute({
      ...row,
      type: row.type as StatusType,
    });
  }

  async findByProject(projectId: string): Promise<StatusView[]> {
    const rows = await this.prisma.status.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    });
    return rows.map(r => this.toView(r));
  }

  async save(status: Status): Promise<void> {
    await this.prisma.status.upsert({
      where: { id: status.id },
      create: {
        id: status.id,
        projectId: status.projectId,
        name: status.name,
        color: status.color,
        type: status.type as any,
        position: status.position,
      },
      update: {
        name: status.name,
        color: status.color,
        type: status.type as any,
        position: status.position,
      },
    });
  }

  async saveMany(statuses: Status[]): Promise<void> {
    await this.prisma.$transaction(
      statuses.map(s =>
        this.prisma.status.upsert({
          where: { id: s.id },
          create: {
            id: s.id,
            projectId: s.projectId,
            name: s.name,
            color: s.color,
            type: s.type as any,
            position: s.position,
          },
          update: { position: s.position },
        }),
      ),
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.status.delete({ where: { id } });
  }

  async nextPosition(projectId: string): Promise<number> {
    const result = await this.prisma.status.aggregate({
      where: { projectId },
      _max: { position: true },
    });
    return (result._max.position ?? -1) + 1;
  }

  private toView(row: {
    id: string;
    projectId: string;
    name: string;
    color: string;
    type: string;
    position: number;
  }): StatusView {
    return {
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      color: row.color,
      type: row.type,
      position: row.position,
    };
  }
}
