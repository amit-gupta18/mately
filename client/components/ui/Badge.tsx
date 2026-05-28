import { cn } from '@/utils/cn';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'purple';

const variants: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger:  'bg-red-100 text-red-700',
  purple:  'bg-indigo-100 text-indigo-700',
};

interface Props { label: string; variant?: Variant; className?: string }

export const Badge = ({ label, variant = 'default', className }: Props) => (
  <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', variants[variant], className)}>
    {label}
  </span>
);
