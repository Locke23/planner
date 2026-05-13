import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCurrentUserQuery } from '../queries/get-current-user.query';
import { USER_REPOSITORY } from '../../domain/repositories/iuser.repository';
import type { IUserRepository } from '../../domain/repositories/iuser.repository';
import { User } from '../../domain/entities/user.entity';

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: IUserRepository) {}

  async execute(query: GetCurrentUserQuery): Promise<User> {
    const user = await this.users.findById(query.userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
