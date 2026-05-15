import { ConflictException } from '@nestjs/common';

export class ProjectIdentifierTakenException extends ConflictException {
  constructor() { super('Project identifier already exists in this workspace'); }
}
