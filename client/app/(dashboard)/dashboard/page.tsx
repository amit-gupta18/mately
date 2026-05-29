'use client';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useGetRooms } from '@/hooks/useRooms';
import { useGetStats, useGetUserSessions } from '@/hooks/useSessions';
import { RoomList } from '@/components/dashboard/RoomList';
import { CreateRoomModal } from '@/components/dashboard/CreateRoomModal';
import { SessionCard } from '@/components/history/SessionCard';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/utils/formatDuration';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { isCreateRoomModalOpen, openCreateRoomModal, closeCreateRoomModal } = useUIStore();
  const { data: rooms, isLoading: loadingRooms } = useGetRooms();
  const { data: stats } = useGetStats();
  const { data: sessions } = useGetUserSessions();

  const myRooms = rooms?.filter((r) => r.owner._id === user?._id || r.participants.some((p) => p._id === user?._id));
  const recentSessions = sessions?.slice(0, 5);

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-sm text-gray-400 mt-1">Ready to study?</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Sessions', value: stats.totalSessions },
            { label: 'Total Hours', value: `${stats.totalHours}h` },
            { label: 'Current Streak', value: `${stats.currentStreak} days` },
            { label: 'Longest Session', value: formatDuration(stats.longestSession * 60) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Your Rooms</h3>
          <Button size="sm" onClick={openCreateRoomModal}>+ New Room</Button>
        </div>
        <RoomList rooms={myRooms} isLoading={loadingRooms} emptyText="You haven't joined any rooms yet." />
      </div>

      {!!recentSessions?.length && (
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Sessions</h3>
          <div className="flex flex-col gap-3">
            {recentSessions.map((s) => <SessionCard key={s._id} session={s} />)}
          </div>
        </div>
      )}

      <CreateRoomModal isOpen={isCreateRoomModalOpen} onClose={closeCreateRoomModal} />
    </div>
  );
}
