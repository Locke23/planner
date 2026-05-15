import { IsArray, IsUUID } from 'class-validator';

export class ReorderStatusesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  orderedIds!: string[];
}
