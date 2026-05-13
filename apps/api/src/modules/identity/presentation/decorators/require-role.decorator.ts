import { SetMetadata } from '@nestjs/common';
import { RoleValue } from '../../domain/value-objects/role.vo';

export const ROLE_KEY = 'requiredRole';
export const RequireRole = (role: RoleValue) => SetMetadata(ROLE_KEY, role);
