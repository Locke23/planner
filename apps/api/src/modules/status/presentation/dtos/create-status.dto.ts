import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import type { StatusType } from '../../domain/entities/status.entity';

export class CreateStatusDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  color!: string;

  @IsEnum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'])
  type!: StatusType;
}
