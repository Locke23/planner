import { IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsString()
  @Matches(/^[A-Z0-9]{1,6}$/, { message: 'Identifier must be 1-6 uppercase letters or digits' })
  identifier!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
