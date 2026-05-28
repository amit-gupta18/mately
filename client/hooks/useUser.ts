'use client';
import { useMutation } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { useAuthStore } from '@/store/authStore';
import { AuthResponse } from '@/types/user';

export const useUpdateProfile = () => {
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: (body: { name?: string; avatar?: string }) =>
      fetcher<AuthResponse>('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: (res) => setUser(res.user),
  });
};
