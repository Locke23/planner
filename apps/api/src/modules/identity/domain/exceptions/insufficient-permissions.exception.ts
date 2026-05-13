export class InsufficientPermissionsException extends Error {
  constructor() { super('Insufficient permissions to perform this action'); }
}
