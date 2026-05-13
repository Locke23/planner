import { RegisterUserHandler } from '../handlers/register-user.handler';
import { RegisterUserCommand } from '../commands/register-user.command';
import { InMemoryUserRepository } from '../in-memory/in-memory-user.repository';
import { EventBusService } from '../../../../shared/infra/event-bus.service';

describe('RegisterUserHandler', () => {
  let handler: RegisterUserHandler;
  let repo: InMemoryUserRepository;
  const eventBus = { publishAll: jest.fn() } as unknown as EventBusService;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    handler = new RegisterUserHandler(repo, eventBus);
    jest.clearAllMocks();
  });

  it('creates and persists a user', async () => {
    const user = await handler.execute(new RegisterUserCommand('bob@test.com', 'Bob', 'pass123'));
    const saved = await repo.findById(user.id);
    expect(saved).not.toBeNull();
    expect(saved!.email.value).toBe('bob@test.com');
  });

  it('hashes the password', async () => {
    const user = await handler.execute(new RegisterUserCommand('bob@test.com', 'Bob', 'pass123'));
    expect(user.passwordHash).not.toBe('pass123');
  });

  it('publishes domain events', async () => {
    await handler.execute(new RegisterUserCommand('bob@test.com', 'Bob', 'pass123'));
    expect(eventBus.publishAll).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictException if email exists', async () => {
    await handler.execute(new RegisterUserCommand('bob@test.com', 'Bob', 'pass'));
    await expect(handler.execute(new RegisterUserCommand('bob@test.com', 'Bob2', 'pass')))
      .rejects.toThrow('Email already in use');
  });
});
