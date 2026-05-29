import { cn } from '@/utils/cn';

const COLORS = [
  'bg-yellow-400', 'bg-orange-400', 'bg-pink-400', 'bg-green-400',
  'bg-teal-400', 'bg-sky-400', 'bg-violet-400', 'bg-rose-400',
];
const colorFor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];
const initials = (name: string) => name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

type Size = 'sm' | 'md' | 'lg';
const sizes: Record<Size, string> = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' };

interface Props { name: string; avatar?: string; size?: Size; className?: string }

export const Avatar = ({ name, avatar, size = 'md', className }: Props) => (
  <div className={cn('rounded-full flex items-center justify-center font-bold text-brand-black shrink-0 border border-brand-black/10', sizes[size], !avatar && colorFor(name), className)}>
    {avatar
      ? <img src={avatar} alt={name} className="h-full w-full rounded-full object-cover" />
      : initials(name)
    }
  </div>
);
