'use client';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { QUERY_KEYS } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import { AuthResponse, User } from '@/types/user';
import { connectSocket, disconnectSocket } from '@/socket/socket';

export const useAuth = () => {
  const { setUser, clearUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: () => fetcher<AuthResponse>('/auth/me'),
    retry: false,
  });

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
      connectSocket();
    } else if (!isLoading) {
      clearUser();
    }
  }, [data, isLoading, setUser, clearUser]);

  const loginMutation = useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      fetcher<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: (res) => {
      setUser(res.user);
      connectSocket();
      queryClient.setQueryData(QUERY_KEYS.me(), res);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (body: { name: string; email: string; password: string }) =>
      fetcher<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: (res) => {
      setUser(res.user);
      connectSocket();
      queryClient.setQueryData(QUERY_KEYS.me(), res);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => fetcher('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      disconnectSocket();
      clearUser();
      queryClient.clear();
    },
  });

  return { loginMutation, registerMutation, logoutMutation, isLoading };
};
