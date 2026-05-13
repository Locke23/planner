import { IsEmail, IsEnum } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  email!: string;

  @IsEnum(['ADMIN', 'MEMBER'])
  role!: 'ADMIN' | 'MEMBER';
}
