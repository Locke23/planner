import { randomUUID } from 'crypto';
import { BaseAggregate } from '../../../../shared/domain/base-aggregate';
import { Email } from '../value-objects/email.vo';
import { UserRegisteredEvent } from '../events/user-registered.event';

export interface CreateUserProps {
  email: string;
  name: string;
  passwordHash: string;
}

export interface ReconstitutedUserProps {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  avatarUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends BaseAggregate {
  private _email: Email;
  private _name: string;
  private _passwordHash: string;
  private _avatarUrl: string | null;

  private constructor(props: ReconstitutedUserProps) {
    const now = new Date();
    super(props.id, props.createdAt ?? now, props.updatedAt ?? now);
    this._email = new Email(props.email);
    this._name = props.name;
    this._passwordHash = props.passwordHash;
    this._avatarUrl = props.avatarUrl ?? null;
  }

  static register(props: CreateUserProps): User {
    const now = new Date();
    const user = new User({ id: randomUUID(), ...props, createdAt: now, updatedAt: now });
    user.addDomainEvent(new UserRegisteredEvent(user.id, user.email.value));
    return user;
  }

  static reconstitute(props: ReconstitutedUserProps): User {
    return new User(props);
  }

  get email(): Email               { return this._email; }
  get name(): string               { return this._name; }
  get passwordHash(): string       { return this._passwordHash; }
  get avatarUrl(): string | null   { return this._avatarUrl; }

  updateProfile(name: string): void {
    this._name = name.trim();
    this.setUpdatedAt(new Date());
  }

  setPasswordHash(hash: string): void {
    this._passwordHash = hash;
    this.setUpdatedAt(new Date());
  }
}
