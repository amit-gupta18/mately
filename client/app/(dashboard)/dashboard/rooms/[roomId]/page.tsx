'use client';
import { use, useState } from 'react';
import { useGetRoom, useInviteUser } from '@/hooks/useRooms';
import { useGetRoomSessions } from '@/hooks/useSessions';
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
import { formatDuration } from '@/utils/formatDuration';
import { formatDate } from '@/utils/formatDate';

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const { data: room, isLoading } = useGetRoom(roomId);
  const { data: roomSessions } = useGetRoomSessions(roomId);
  const { user } = useAuthStore();

  useRoomSocket(roomId);
  const timerActions = useTimerSocket(roomId);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [rightTab, setRightTab] = useState<'participants' | 'history'>('participants');
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

  if (isLoading) return (
    <div className="flex h-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
  if (!room) return <div className="p-6 font-bold text-brand-black/40">Room not found.</div>;

  const isOwner = room.owner._id === user?._id;

  return (
    <div className="flex h-full gap-0 overflow-hidden -m-6 p-0">
      {/* Left panel */}
      <div className="flex flex-col flex-1 overflow-hidden border-r-2 border-brand-border">
        {/* Room header */}
        <div className="flex items-center justify-between border-b-2 border-brand-border bg-brand-white px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-black text-brand-black">{room.name}</h2>
            <Badge label={room.isPrivate ? 'Private' : 'Public'} variant={room.isPrivate ? 'warning' : 'success'} />
          </div>
          {isOwner && (
            <Button size="sm" variant="secondary" onClick={() => setInviteOpen(true)}>
              + Invite
            </Button>
          )}
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center gap-4 py-8 border-b-2 border-brand-border bg-brand-yellow/20">
          <StudyTimer />
          <TimerControls {...timerActions} />
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow roomId={roomId} />
        </div>
      </div>

      {/* Right panel */}
      <div className="w-56 shrink-0 flex flex-col bg-brand-white border-l-0">
        {/* Tab switcher */}
        <div className="grid grid-cols-2 border-b-2 border-brand-border">
          {(['participants', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setRightTab(tab)}
              className={`py-3 text-xs font-black uppercase tracking-widest transition-colors ${
                rightTab === tab
                  ? 'bg-brand-yellow text-brand-black border-b-2 border-brand-black'
                  : 'text-brand-black/40 hover:text-brand-black hover:bg-brand-gray'
              }`}
            >
              {tab === 'participants' ? '👥 Online' : '📋 History'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {rightTab === 'participants' ? (
            <ParticipantList />
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-black uppercase tracking-widest text-brand-black/40">
                Sessions — {roomSessions?.length ?? 0}
              </p>
              {!roomSessions?.length ? (
                <p className="text-xs font-medium text-brand-black/30 text-center py-6">
                  No sessions yet.
                </p>
              ) : (
                roomSessions.map((s) => (
                  <div key={s._id} className="rounded-xl border-2 border-brand-border p-3 hover:border-brand-black transition-colors">
                    <p className="text-xs font-black text-brand-black">
                      {s.duration != null ? formatDuration(s.duration) : '—'}
                    </p>
                    <p className="text-xs font-medium text-brand-black/40 mt-0.5">
                      {formatDate(s.startedAt)}
                    </p>
                    <p className="text-xs font-medium text-brand-black/40">
                      {s.participants.length} participants
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <SessionSummary />

      <Modal isOpen={inviteOpen} onClose={() => { setInviteOpen(false); setInviteMsg(''); }} title="Invite to Room">
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <Input
            label="User Email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="user@example.com"
            required
          />
          {inviteMsg && (
            <p className={`text-sm font-bold ${inviteMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
              {inviteMsg}
            </p>
          )}
          <Button type="submit" loading={inviteMutation.isPending}>Send Invite</Button>
        </form>
      </Modal>
    </div>
  );
}
