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
    <div className="flex items-end gap-2 border-t border-gray-200 p-3">
      <textarea
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        disabled={disabled}
        placeholder="Message..."
        className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50"
      />
      <button
        onClick={send}
        disabled={disabled || !text.trim()}
        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </div>
  );
};
