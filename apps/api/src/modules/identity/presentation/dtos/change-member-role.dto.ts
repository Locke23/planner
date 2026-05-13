import { IsEnum } from 'class-validator';

export class ChangeMemberRoleDto {
  @IsEnum(['ADMIN', 'MEMBER'])
  role!: 'ADMIN' | 'MEMBER';
}
