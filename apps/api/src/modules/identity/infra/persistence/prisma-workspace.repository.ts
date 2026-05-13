import { Injectable } from '@nestjs/common';
import { Role, type Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infra/prisma.service';
import type { IWorkspaceRepository } from '../../domain/repositories/iworkspace.repository';
import { Workspace } from '../../domain/entities/workspace.entity';
import { Member } from '../../domain/entities/member.entity';

type WorkspaceRow = Prisma.WorkspaceGetPayload<{ include: { members: true } }>;

@Injectable()
export class PrismaWorkspaceRepository implements IWorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Workspace | null> {
    const row = await this.prisma.workspace.findUnique({ where: { id }, include: { members: true } });
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    const row = await this.prisma.workspace.findUnique({ where: { slug }, include: { members: true } });
    return row ? this.toDomain(row) : null;
  }

  async findByUserId(userId: string): Promise<Workspace[]> {
    const rows = await this.prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      include: { members: true },
    });
    return rows.map(r => this.toDomain(r));
  }

  async save(workspace: Workspace): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.workspace.upsert({
        where: { id: workspace.id },
        create: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug.value,
          ownerId: workspace.ownerId,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        },
        update: { name: workspace.name, updatedAt: workspace.updatedAt },
      });

      const memberIds = workspace.members.map(m => m.userId);
      await tx.member.deleteMany({
        where: { workspaceId: workspace.id, userId: { notIn: memberIds } },
      });

      for (const member of workspace.members) {
        await tx.member.upsert({
          where: { workspaceId_userId: { workspaceId: workspace.id, userId: member.userId } },
          create: { workspaceId: workspace.id, userId: member.userId, role: member.role as Role, joinedAt: member.joinedAt },
          update: { role: member.role as Role },
        });
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workspace.delete({ where: { id } });
  }

  private toDomain(row: WorkspaceRow): Workspace {
    const members: Member[] = row.members.map((m) =>
      new Member(m.userId, m.workspaceId, m.role, m.joinedAt),
    );
    return Workspace.reconstitute({
      id: row.id,
      name: row.name,
      slug: row.slug,
      ownerId: row.ownerId,
      members,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
