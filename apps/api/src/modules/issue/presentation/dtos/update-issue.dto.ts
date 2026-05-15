import { IsString, IsOptional, IsArray, IsEnum, IsUUID, MinLength, MaxLength, Allow } from 'class-validator';
import { PriorityEnum } from './create-issue.dto';

export class UpdateIssueDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  statusId?: string;

  @IsOptional()
  @Allow()
  assigneeId?: string | null;

  @IsOptional()
  @IsEnum(PriorityEnum)
  priority?: PriorityEnum;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  labelIds?: string[];
}
