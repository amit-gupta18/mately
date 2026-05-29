'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { registerMutation } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      await registerMutation.mutateAsync({ name, email, password });
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="flex h-screen bg-brand-yellow dot-grid">
      <div className="m-auto w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-black text-brand-black">Mately ⚡</Link>
        </div>
        <div className="rounded-2xl border-2 border-brand-black bg-brand-white p-8 shadow-[6px_6px_0px_#0A0A0A]">
          <h1 className="mb-1 text-2xl font-black text-brand-black">Create account.</h1>
          <p className="mb-6 text-sm font-medium text-brand-black/50">Start your study journey today</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required />
            {error && <p className="text-sm font-bold text-red-500">{error}</p>}
            <Button type="submit" loading={registerMutation.isPending} size="lg" className="w-full mt-1">Create Account</Button>
          </form>

          <p className="mt-5 text-center text-sm font-medium text-brand-black/50">
            Already have an account?{' '}
            <Link href="/login" className="font-black text-brand-black underline underline-offset-2">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
