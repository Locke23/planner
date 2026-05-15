import { NotFoundException } from '@nestjs/common';

export class IssueNotFoundException extends NotFoundException {
  constructor() {
    super('Issue not found');
  }
}
