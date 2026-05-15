import { NotFoundException } from '@nestjs/common';

export class StatusNotFoundException extends NotFoundException {
  constructor() {
    super('Status not found');
  }
}
