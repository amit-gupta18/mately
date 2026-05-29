'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUpdateProfile } from '@/hooks/useUser';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);
  const updateProfile = useUpdateProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-400 mt-1">Update your profile</p>
      </div>

      <div className="flex items-center gap-4">
        {user && <Avatar name={user.name} avatar={user.avatar} size="lg" />}
        <div>
          <p className="font-medium text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Display Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email" value={user?.email ?? ''} disabled className="bg-gray-50" />
        <div className="flex items-center gap-3">
          <Button type="submit" loading={updateProfile.isPending}>Save Changes</Button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </form>
    </div>
  );
}
