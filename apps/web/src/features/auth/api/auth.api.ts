import { api } from '../../../shared/lib/axios';
import type { AuthResponse, LoginDto, RegisterDto, UserDto } from '@org/shared-types';

export async function registerUser(dto: RegisterDto): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', dto);
  return data;
}

export async function loginUser(dto: LoginDto): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', dto);
  return data;
}

export async function refreshAccessToken(): Promise<{ accessToken: string }> {
  const { data } = await api.post<{ accessToken: string }>('/auth/refresh');
  return data;
}

export async function getMe(): Promise<UserDto> {
  const { data } = await api.get<UserDto>('/auth/me');
  return data;
}

export async function logoutUser(): Promise<void> {
  await api.post('/auth/logout');
}
