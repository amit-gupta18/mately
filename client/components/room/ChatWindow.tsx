'use client';
import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useChatSocket } from '@/socket/useChatSocket';
import { useSocket } from '@/socket/useSocket';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export const ChatWindow = ({ roomId }: { roomId: string }) => {
  const { messages } = useChatStore();
  const { sendMessage } = useChatSocket(roomId);
  const { isConnected } = useSocket();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No messages yet. Say hi! 👋</p>
        )}
        {messages.map((m) => <ChatMessage key={m._id} message={m} />)}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={sendMessage} disabled={!isConnected} />
    </div>
  );
};
