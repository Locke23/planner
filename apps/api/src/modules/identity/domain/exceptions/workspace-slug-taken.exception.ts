export class WorkspaceSlugTakenException extends Error {
  constructor(slug: string) { super(`Workspace slug already taken: ${slug}`); }
}
