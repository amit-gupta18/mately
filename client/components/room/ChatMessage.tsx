'use client';
import { Message } from '@/types/message';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelative } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

export const ChatMessage = ({ message }: { message: Message }) => {
  const { user } = useAuthStore();
  const isOwn = message.sender._id === user?._id;

  return (
    <div className={cn('flex gap-2 items-end', isOwn && 'flex-row-reverse')}>
      <Avatar name={message.sender.name} avatar={message.sender.avatar} size="sm" />
      <div className={cn('flex flex-col gap-0.5 max-w-[70%]', isOwn && 'items-end')}>
        <span className="text-xs font-bold text-brand-black/40">{isOwn ? 'You' : message.sender.name}</span>
        <div className={cn(
          'rounded-2xl px-3 py-2 text-sm font-medium border-2',
          isOwn
            ? 'bg-brand-black text-brand-white border-brand-black rounded-br-sm'
            : 'bg-brand-gray text-brand-black border-brand-border rounded-bl-sm'
        )}>
          {message.text}
        </div>
        <span className="text-xs text-brand-black/30">{formatRelative(message.createdAt)}</span>
      </div>
    </div>
  );
};
