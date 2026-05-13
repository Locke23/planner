import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RegisterUserCommand } from '../commands/register-user.command';
import { USER_REPOSITORY } from '../../domain/repositories/iuser.repository';
import type { IUserRepository } from '../../domain/repositories/iuser.repository';
import { User } from '../../domain/entities/user.entity';
import { EventBusService } from '../../../../shared/infra/event-bus.service';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(cmd: RegisterUserCommand): Promise<User> {
    const existing = await this.users.findByEmail(cmd.email);
    if (existing) throw new ConflictException('Email already in use');
    const passwordHash = await bcrypt.hash(cmd.password, 12);
    const user = User.register({ email: cmd.email, name: cmd.name, passwordHash });
    await this.users.save(user);
    this.eventBus.publishAll(user);
    return user;
  }
}
