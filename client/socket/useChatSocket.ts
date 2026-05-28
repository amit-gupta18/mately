'use client';
import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSocket } from './socket';
import { useChatStore } from '@/store/chatStore';
import { fetcher } from '@/lib/fetcher';
import { QUERY_KEYS } from '@/lib/constants';
import { Message } from '@/types/message';

export const useChatSocket = (roomId: string) => {
  const { setMessages, addMessage, clearMessages } = useChatStore();

  const { data: history } = useQuery({
    queryKey: QUERY_KEYS.roomMessages(roomId),
    queryFn: () => fetcher<{ success: boolean; messages: Message[] }>(`/rooms/${roomId}/messages`),
    select: (data) => data.messages,
  });

  useEffect(() => {
    if (history) setMessages(history);
  }, [history, setMessages]);

  useEffect(() => {
    const socket = getSocket();
    const onMessage = (msg: Message) => addMessage(msg);
    socket.on('chat:message', onMessage);
    return () => {
      socket.off('chat:message', onMessage);
      clearMessages();
    };
  }, [addMessage, clearMessages]);

  const sendMessage = useCallback((text: string) => {
    getSocket().emit('chat:message', { roomId, text });
  }, [roomId]);

  return { sendMessage };
};
