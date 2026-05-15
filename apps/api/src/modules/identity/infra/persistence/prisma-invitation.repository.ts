import { Injectable } from '@nestjs/common';
import { type Invitation, Role } from '@prisma/client';
import { PrismaService } from '../../../../shared/infra/prisma.service';
import { IInvitationRepository, InvitationRecord } from '../../domain/repositories/iinvitation.repository';

@Injectable()
export class PrismaInvitationRepository implements IInvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByToken(token: string): Promise<InvitationRecord | null> {
    const row = await this.prisma.invitation.findUnique({ where: { token } });
    return row ? this.toRecord(row) : null;
  }

  async save(inv: InvitationRecord): Promise<void> {
    await this.prisma.invitation.upsert({
      where: { id: inv.id },
      create: {
        id: inv.id,
        workspaceId: inv.workspaceId,
        email: inv.email,
        role: inv.role as Role,
        token: inv.token,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      },
      update: { acceptedAt: inv.acceptedAt },
    });
  }

  async markAccepted(id: string): Promise<void> {
    await this.prisma.invitation.update({ where: { id }, data: { acceptedAt: new Date() } });
  }

  private toRecord(row: Invitation): InvitationRecord {
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      email: row.email,
      role: row.role,
      token: row.token,
      expiresAt: row.expiresAt,
      acceptedAt: row.acceptedAt,
      createdAt: row.createdAt,
    };
  }
}
