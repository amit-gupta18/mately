'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

const NAV = [
  { href: '/dashboard',          label: 'Dashboard',    icon: '⚡' },
  { href: '/dashboard/rooms',    label: 'Browse Rooms', icon: '🚪' },
  { href: '/dashboard/history',  label: 'History',      icon: '📋' },
  { href: '/dashboard/settings', label: 'Settings',     icon: '⚙️' },
];

export const Sidebar = () => {
  const path = usePathname();
  return (
    <aside className="flex h-full w-56 flex-col bg-brand-black px-3 py-6">
      <div className="mb-8 px-3">
        <span className="text-xl font-black text-brand-yellow tracking-tight">Mately ⚡</span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all',
                active
                  ? 'bg-brand-yellow text-brand-black'
                  : 'text-white/60 hover:bg-white/10 hover:text-white',
              )}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
