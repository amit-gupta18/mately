'use client';
import { useEffect } from 'react';
import { cn } from '@/utils/cn';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, title, children, className }: Props) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-black/50" onClick={onClose} />
      <div className={cn('relative z-10 w-full max-w-md rounded-2xl bg-brand-white border-2 border-brand-black p-6 shadow-[4px_4px_0px_#0A0A0A]', className)}>
        {title && (
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black text-brand-black">{title}</h2>
            <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-brand-black text-brand-black hover:bg-brand-yellow font-bold text-sm transition-colors">&times;</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
