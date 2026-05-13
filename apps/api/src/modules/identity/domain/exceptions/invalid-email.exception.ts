export class InvalidEmailException extends Error {
  constructor(email: string) { super(`Invalid email address: ${email}`); }
}
