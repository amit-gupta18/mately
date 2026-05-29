'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-brand-yellow dot-grid">
      <div className="flex flex-col items-center gap-3">
        <span className="text-3xl font-black text-brand-black">Mately ⚡</span>
        <div className="h-1 w-24 rounded-full bg-brand-black/20 overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-brand-black animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (!user) return null;
  return <>{children}</>;
};
