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
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-base font-semibold text-gray-900">{title ?? 'Mately'}</h1>
      {user && (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} avatar={user.avatar} size="sm" />
          <span className="text-sm text-gray-700">{user.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout} loading={logoutMutation.isPending}>
            Logout
          </Button>
        </div>
      )}
    </header>
  );
};
