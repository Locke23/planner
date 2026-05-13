import { InvalidSlugException } from '../exceptions/invalid-slug.exception';

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

export class WorkspaceSlug {
  readonly value: string;

  constructor(raw: string) {
    const slug = raw.trim().toLowerCase();
    if (!SLUG_REGEX.test(slug)) throw new InvalidSlugException(raw);
    this.value = slug;
  }

  equals(other: WorkspaceSlug): boolean { return this.value === other.value; }
  toString(): string { return this.value; }
}
