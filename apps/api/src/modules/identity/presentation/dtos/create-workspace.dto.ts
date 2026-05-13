import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/, {
    message: 'Slug must be 3-50 lowercase letters, numbers, or hyphens',
  })
  slug!: string;
}
