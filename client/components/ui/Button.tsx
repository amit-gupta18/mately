'use client';
import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-brand-black text-brand-white hover:bg-brand-black/80 disabled:bg-brand-black/40',
  secondary: 'bg-brand-white text-brand-black border-2 border-brand-black hover:bg-brand-yellow disabled:opacity-50',
  danger:    'bg-brand-black text-brand-white border border-red-500 hover:bg-red-600 disabled:opacity-40',
  ghost:     'bg-transparent text-brand-black hover:bg-brand-black/5',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-xs',
  md: 'px-5 py-2 text-sm',
  lg: 'px-7 py-3 text-base',
};

export const Button = ({ variant = 'primary', size = 'md', loading, disabled, className, children, ...props }: Props) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-tight transition-all focus:outline-none focus:ring-2 focus:ring-brand-black focus:ring-offset-2 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      className,
    )}
  >
    {loading && <Spinner size="sm" />}
    {children}
  </button>
);
