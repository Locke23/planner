import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { getMe, loginUser, logoutUser, registerUser } from '../api/auth.api';
import { token } from '../../../shared/lib/token';
import type { LoginDto, RegisterDto } from '@org/shared-types';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: !!token.get(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: LoginDto) => loginUser(dto),
    onSuccess: (data) => {
      token.set(data.accessToken);
      queryClient.setQueryData(['auth', 'me'], data.user);
      navigate({ to: '/' });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: RegisterDto) => registerUser(dto),
    onSuccess: (data) => {
      token.set(data.accessToken);
      queryClient.setQueryData(['auth', 'me'], data.user);
      navigate({ to: '/' });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      token.clear();
      queryClient.clear();
      navigate({ to: '/login' });
    },
  });
}
