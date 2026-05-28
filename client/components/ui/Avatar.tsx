import { cn } from '@/utils/cn';

const COLORS = [
  'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-green-400',
  'bg-teal-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400',
];

const colorFor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

const initials = (name: string) =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

type Size = 'sm' | 'md' | 'lg';
const sizes: Record<Size, string> = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' };

interface Props { name: string; avatar?: string; size?: Size; className?: string }

export const Avatar = ({ name, avatar, size = 'md', className }: Props) => (
  <div className={cn('rounded-full flex items-center justify-center font-semibold text-white shrink-0', sizes[size], !avatar && colorFor(name), className)}>
    {avatar ? (
      <img src={avatar} alt={name} className="h-full w-full rounded-full object-cover" />
    ) : (
      initials(name)
    )}
  </div>
);
