'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { QUERY_KEYS } from '@/lib/constants';
import { Room } from '@/types/room';

interface RoomListResponse { success: boolean; rooms: Room[] }
interface RoomResponse { success: boolean; room: Room }

export const useGetRooms = () =>
  useQuery({
    queryKey: QUERY_KEYS.rooms(),
    queryFn: () => fetcher<RoomListResponse>('/rooms'),
    select: (d) => d.rooms,
  });

export const useGetRoom = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.room(id),
    queryFn: () => fetcher<RoomResponse>(`/rooms/${id}`),
    select: (d) => d.room,
    enabled: !!id,
  });

export const useCreateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description?: string; isPrivate?: boolean; maxParticipants?: number }) =>
      fetcher<RoomResponse>('/rooms', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.rooms() }),
  });
};

export const useDeleteRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetcher(`/rooms/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.rooms() }),
  });
};

export const useInviteUser = (roomId: string) =>
  useMutation({
    mutationFn: (email: string) =>
      fetcher(`/rooms/${roomId}/invite`, { method: 'POST', body: JSON.stringify({ email }) }),
  });
