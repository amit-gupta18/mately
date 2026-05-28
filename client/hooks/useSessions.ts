'use client';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { QUERY_KEYS } from '@/lib/constants';
import { Session, SessionStats } from '@/types/session';

export const useGetUserSessions = () =>
  useQuery({
    queryKey: QUERY_KEYS.sessions(),
    queryFn: () => fetcher<{ success: boolean; sessions: Session[] }>('/sessions'),
    select: (d) => d.sessions,
  });

export const useGetRoomSessions = (roomId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.sessionsByRoom(roomId),
    queryFn: () => fetcher<{ success: boolean; sessions: Session[] }>(`/sessions/room/${roomId}`),
    select: (d) => d.sessions,
    enabled: !!roomId,
  });

export const useGetStats = () =>
  useQuery({
    queryKey: QUERY_KEYS.stats(),
    queryFn: () => fetcher<{ success: boolean; data: SessionStats }>('/sessions/stats'),
    select: (d) => d.data,
  });
