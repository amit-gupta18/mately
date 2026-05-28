'use client';
import { useEffect } from 'react';
import { getSocket } from './socket';
import { useRoomStore } from '@/store/roomStore';

export const useRoomSocket = (roomId: string) => {
  const { setParticipants, addParticipant, removeParticipant, setActiveRoom } = useRoomStore();

  useEffect(() => {
    const socket = getSocket();
    setActiveRoom(roomId);

    socket.emit('room:join', { roomId });
    socket.emit('timer:sync_request', { roomId });

    const onList = ({ participants }: { participants: { _id: string; name: string; avatar?: string }[] }) => {
      setParticipants(participants);
    };
    const onJoined = ({ user }: { user: { _id: string; name: string; avatar?: string } }) => {
      addParticipant(user);
    };
    const onLeft = ({ userId }: { userId: string }) => {
      removeParticipant(userId);
    };

    socket.on('room:participants_list', onList);
    socket.on('room:participant_joined', onJoined);
    socket.on('room:participant_left', onLeft);

    return () => {
      socket.emit('room:leave', { roomId });
      socket.off('room:participants_list', onList);
      socket.off('room:participant_joined', onJoined);
      socket.off('room:participant_left', onLeft);
    };
  }, [roomId, setParticipants, addParticipant, removeParticipant, setActiveRoom]);
};
