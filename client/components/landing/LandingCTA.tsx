'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';

export const LandingCTA = () => {
  useAuth();
  const { user, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (user) {
    return (
      <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-brand-black px-8 py-3.5 text-base font-black text-brand-yellow border-2 border-brand-black hover:bg-brand-black/80 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
        Go to Dashboard →
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Link href="/register" className="inline-flex items-center rounded-full bg-brand-black px-8 py-3.5 text-base font-black text-brand-yellow border-2 border-brand-black hover:bg-brand-black/80 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
        Get Started — it&apos;s free
      </Link>
      <Link href="/login" className="inline-flex items-center rounded-full border-2 border-brand-black bg-brand-white px-8 py-3.5 text-base font-black text-brand-black hover:bg-brand-yellow transition-colors shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
        Sign In
      </Link>
    </div>
  );
};
