'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginMutation } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await loginMutation.mutateAsync({ email, password });
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="flex h-screen bg-brand-yellow dot-grid">
      <div className="m-auto w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-black text-brand-black">Mately ⚡</Link>
        </div>
        <div className="rounded-2xl border-2 border-brand-black bg-brand-white p-8 shadow-[6px_6px_0px_#0A0A0A]">
          <h1 className="mb-1 text-2xl font-black text-brand-black">Welcome back.</h1>
          <p className="mb-6 text-sm font-medium text-brand-black/50">Sign in to keep studying</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            {error && <p className="text-sm font-bold text-red-500">{error}</p>}
            <Button type="submit" loading={loginMutation.isPending} size="lg" className="w-full mt-1">Sign In</Button>
          </form>

          <p className="mt-5 text-center text-sm font-medium text-brand-black/50">
            No account?{' '}
            <Link href="/register" className="font-black text-brand-black underline underline-offset-2">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
