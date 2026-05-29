'use client';
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, id, ...props }, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-bold text-brand-black">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        {...props}
        className={cn(
          'rounded-xl border-2 bg-brand-white px-4 py-2.5 text-sm text-brand-black outline-none transition-colors placeholder:text-black/30 disabled:bg-brand-gray',
          error
            ? 'border-red-500 focus:border-red-600'
            : 'border-brand-border focus:border-brand-black',
          className,
        )}
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
