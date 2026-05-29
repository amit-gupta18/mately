'use client';
import { useState, KeyboardEvent } from 'react';

interface Props { onSend: (text: string) => void; disabled?: boolean }

export const ChatInput = ({ onSend, disabled }: Props) => {
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex items-end gap-2 border-t-2 border-brand-border bg-brand-white p-3">
      <textarea
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        disabled={disabled}
        placeholder={disabled ? 'Connecting…' : 'Message…'}
        className="flex-1 resize-none rounded-xl border-2 border-brand-border bg-brand-gray px-3 py-2 text-sm font-medium text-brand-black outline-none transition-colors placeholder:text-brand-black/30 focus:border-brand-black disabled:opacity-50"
      />
      <button
        onClick={send}
        disabled={disabled || !text.trim()}
        className="rounded-full bg-brand-black px-4 py-2 text-sm font-bold text-brand-white hover:bg-brand-black/80 disabled:bg-brand-black/30 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </div>
  );
};
