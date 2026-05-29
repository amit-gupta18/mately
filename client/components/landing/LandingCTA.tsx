'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';

export const LandingCTA = () => {
  useAuth(); // rehydrates user from cookie silently
  const { user, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (user) {
    return (
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
      >
        Go to Dashboard →
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Link
        href="/register"
        className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
      >
        Get Started — it&apos;s free
      </Link>
      <Link
        href="/login"
        className="inline-flex items-center rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
      >
        Sign In
      </Link>
    </div>
  );
};
