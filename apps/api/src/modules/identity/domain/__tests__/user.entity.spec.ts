import { User } from '../entities/user.entity';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { InvalidEmailException } from '../exceptions/invalid-email.exception';

describe('User', () => {
  const valid = { email: 'alice@example.com', name: 'Alice', passwordHash: 'hashed' };

  it('creates a user with UUID', () => {
    expect(User.register(valid).id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('normalizes email to lowercase', () => {
    expect(User.register({ ...valid, email: 'Alice@EXAMPLE.COM' }).email.value).toBe('alice@example.com');
  });

  it('raises UserRegisteredEvent', () => {
    const user = User.register(valid);
    expect(user.domainEvents[0]).toBeInstanceOf(UserRegisteredEvent);
  });

  it('throws InvalidEmailException for bad email', () => {
    expect(() => User.register({ ...valid, email: 'bad' })).toThrow(InvalidEmailException);
  });

  it('reconstitute does not raise events', () => {
    expect(User.reconstitute({ id: 'x', ...valid }).domainEvents).toHaveLength(0);
  });
});
