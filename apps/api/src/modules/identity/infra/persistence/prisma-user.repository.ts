import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infra/prisma.service';
import type { IUserRepository } from '../../domain/repositories/iuser.repository';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email.value,
        name: user.name,
        passwordHash: user.passwordHash,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      update: {
        name: user.name,
        passwordHash: user.passwordHash,
        avatarUrl: user.avatarUrl,
        updatedAt: user.updatedAt,
      },
    });
  }

  private toDomain(row: {
    id: string; email: string; name: string;
    passwordHash: string; avatarUrl: string | null;
    createdAt: Date; updatedAt: Date;
  }): User {
    return User.reconstitute(row);
  }
}
