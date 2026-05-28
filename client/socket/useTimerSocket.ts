'use client';
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from './socket';
import { useRoomStore } from '@/store/roomStore';
import { useUIStore } from '@/store/uiStore';
import { QUERY_KEYS } from '@/lib/constants';

export const useTimerSocket = (roomId: string) => {
  const { startTimer, pauseTimer, resumeTimer, syncTimer, resetTimer } = useRoomStore();
  const { openSessionSummary } = useUIStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const onStarted = ({ startedAt, sessionId }: { startedAt: number; sessionId: string }) => {
      startTimer({ startedAt, sessionId });
    };
    const onPaused = ({ elapsed }: { elapsed: number }) => pauseTimer(elapsed);
    const onResumed = ({ startedAt }: { startedAt: number }) => resumeTimer(startedAt);
    const onSync = (payload: { isRunning: boolean; elapsed: number; startedAt?: number }) => {
      syncTimer(payload);
    };
    const onEnded = ({ duration }: { duration: number }) => {
      resetTimer();
      openSessionSummary(duration);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions() });
    };

    socket.on('timer:started', onStarted);
    socket.on('timer:paused', onPaused);
    socket.on('timer:resumed', onResumed);
    socket.on('timer:sync', onSync);
    socket.on('timer:ended', onEnded);

    return () => {
      socket.off('timer:started', onStarted);
      socket.off('timer:paused', onPaused);
      socket.off('timer:resumed', onResumed);
      socket.off('timer:sync', onSync);
      socket.off('timer:ended', onEnded);
    };
  }, [roomId, startTimer, pauseTimer, resumeTimer, syncTimer, resetTimer, openSessionSummary, queryClient]);

  const emitStart = useCallback(() => getSocket().emit('timer:start', { roomId }), [roomId]);
  const emitPause = useCallback(() => getSocket().emit('timer:pause', { roomId }), [roomId]);
  const emitResume = useCallback(() => getSocket().emit('timer:resume', { roomId }), [roomId]);
  const emitEnd = useCallback(() => getSocket().emit('timer:end', { roomId }), [roomId]);

  return { emitStart, emitPause, emitResume, emitEnd };
};
