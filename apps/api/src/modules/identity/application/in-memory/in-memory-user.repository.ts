import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/iuser.repository';

export class InMemoryUserRepository implements IUserRepository {
  private store = new Map<string, User>();

  async findById(id: string): Promise<User | null>  { return this.store.get(id) ?? null; }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.email.value === email.toLowerCase()) return user;
    }
    return null;
  }

  async save(user: User): Promise<void> { this.store.set(user.id, user); }

  seed(user: User): User { this.store.set(user.id, user); return user; }
  clear(): void { this.store.clear(); }
}
