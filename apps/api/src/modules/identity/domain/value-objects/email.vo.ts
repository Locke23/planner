import { InvalidEmailException } from '../exceptions/invalid-email.exception';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  readonly value: string;

  constructor(raw: string) {
    const normalized = raw.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) throw new InvalidEmailException(raw);
    this.value = normalized;
  }

  equals(other: Email): boolean { return this.value === other.value; }
  toString(): string { return this.value; }
}
