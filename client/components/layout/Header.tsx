'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export const Header = ({ title }: { title?: string }) => {
  const { user } = useAuthStore();
  const { logoutMutation } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.replace('/login');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b-2 border-brand-border bg-brand-white px-6">
      <h1 className="text-sm font-black text-brand-black tracking-tight uppercase">{title ?? 'Dashboard'}</h1>
      {user && (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} avatar={user.avatar} size="sm" />
          <span className="text-sm font-bold text-brand-black">{user.name}</span>
          <Button variant="secondary" size="sm" onClick={handleLogout} loading={logoutMutation.isPending}>
            Logout
          </Button>
        </div>
      )}
    </header>
  );
};
