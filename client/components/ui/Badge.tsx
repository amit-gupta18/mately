import { cn } from '@/utils/cn';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'yellow';

const variants: Record<Variant, string> = {
  default: 'bg-brand-gray text-brand-black border border-brand-border',
  success: 'bg-green-100 text-green-800 border border-green-200',
  warning: 'bg-brand-yellow text-brand-black border border-brand-black/20',
  danger:  'bg-red-100 text-red-700 border border-red-200',
  yellow:  'bg-brand-yellow text-brand-black border border-brand-black/20',
};

interface Props { label: string; variant?: Variant; className?: string }

export const Badge = ({ label, variant = 'default', className }: Props) => (
  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold', variants[variant], className)}>
    {label}
  </span>
);
