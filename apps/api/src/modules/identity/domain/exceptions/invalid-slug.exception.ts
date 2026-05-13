export class InvalidSlugException extends Error {
  constructor(slug: string) {
    super(`Invalid workspace slug "${slug}". Must be 3-50 lowercase alphanumeric chars or hyphens, starting and ending with a letter/digit.`);
  }
}
