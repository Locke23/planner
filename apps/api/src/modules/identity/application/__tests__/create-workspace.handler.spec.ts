import { CreateWorkspaceHandler } from '../handlers/create-workspace.handler';
import { CreateWorkspaceCommand } from '../commands/create-workspace.command';
import { InMemoryWorkspaceRepository } from '../in-memory/in-memory-workspace.repository';
import { EventBusService } from '../../../../shared/infra/event-bus.service';

describe('CreateWorkspaceHandler', () => {
  let handler: CreateWorkspaceHandler;
  let repo: InMemoryWorkspaceRepository;
  const eventBus = { publishAll: jest.fn() } as unknown as EventBusService;

  beforeEach(() => {
    repo = new InMemoryWorkspaceRepository();
    handler = new CreateWorkspaceHandler(repo, eventBus);
    jest.clearAllMocks();
  });

  it('creates and persists workspace with owner member', async () => {
    await handler.execute(new CreateWorkspaceCommand('Acme', 'acme-corp', 'owner-id'));
    const saved = await repo.findBySlug('acme-corp');
    expect(saved!.hasMember('owner-id')).toBe(true);
  });

  it('throws ConflictException if slug taken', async () => {
    await handler.execute(new CreateWorkspaceCommand('Acme', 'acme-corp', 'owner-id'));
    await expect(
      handler.execute(new CreateWorkspaceCommand('Acme 2', 'acme-corp', 'owner-2')),
    ).rejects.toThrow('Workspace slug already taken');
  });
});
