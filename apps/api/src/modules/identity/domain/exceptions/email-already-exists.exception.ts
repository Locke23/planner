export class EmailAlreadyExistsException extends Error {
  constructor(email: string) { super(`Email already in use: ${email}`); }
}
