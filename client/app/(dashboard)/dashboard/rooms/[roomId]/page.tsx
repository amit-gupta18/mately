'use client';
import { use, useState } from 'react';
import { useGetRoom, useInviteUser } from '@/hooks/useRooms';
import { useRoomSocket } from '@/socket/useRoomSocket';
import { useTimerSocket } from '@/socket/useTimerSocket';
import { useRoomStore } from '@/store/roomStore';
import { useAuthStore } from '@/store/authStore';
import { StudyTimer } from '@/components/room/StudyTimer';
import { TimerControls } from '@/components/room/TimerControls';
import { ParticipantList } from '@/components/room/ParticipantList';
import { ChatWindow } from '@/components/room/ChatWindow';
import { SessionSummary } from '@/components/room/SessionSummary';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const { data: room, isLoading } = useGetRoom(roomId);
  const { user } = useAuthStore();

  useRoomSocket(roomId);
  const timerActions = useTimerSocket(roomId);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const inviteMutation = useInviteUser(roomId);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inviteMutation.mutateAsync(inviteEmail);
      setInviteMsg('Invited successfully!');
      setInviteEmail('');
    } catch (err: unknown) {
      setInviteMsg(err instanceof Error ? err.message : 'Failed to invite');
    }
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" className="text-indigo-600" /></div>;
  if (!room) return <div className="p-6 text-gray-500">Room not found.</div>;

  const isOwner = room.owner._id === user?._id;

  return (
    <div className="flex h-full gap-4 overflow-hidden -m-6 p-0">
      {/* Left panel */}
      <div className="flex flex-col flex-1 overflow-hidden border-r border-gray-200">
        {/* Room header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{room.name}</h2>
            <Badge label={room.isPrivate ? 'Private' : 'Public'} variant={room.isPrivate ? 'warning' : 'success'} />
          </div>
          {isOwner && (
            <Button size="sm" variant="secondary" onClick={() => setInviteOpen(true)}>Invite</Button>
          )}
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center gap-4 py-8 border-b border-gray-200 bg-white">
          <StudyTimer />
          <TimerControls {...timerActions} />
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow roomId={roomId} />
        </div>
      </div>

      {/* Right panel — participants */}
      <div className="w-52 shrink-0 overflow-y-auto bg-white px-4 py-6">
        <ParticipantList />
      </div>

      <SessionSummary />

      <Modal isOpen={inviteOpen} onClose={() => { setInviteOpen(false); setInviteMsg(''); }} title="Invite to Room">
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <Input label="User Email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@example.com" required />
          {inviteMsg && <p className="text-sm text-indigo-600">{inviteMsg}</p>}
          <Button type="submit" loading={inviteMutation.isPending}>Send Invite</Button>
        </form>
      </Modal>
    </div>
  );
}
