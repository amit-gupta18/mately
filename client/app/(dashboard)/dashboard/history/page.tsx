'use client';
import { useGetUserSessions, useGetStats } from '@/hooks/useSessions';
import { SessionList } from '@/components/history/SessionList';
import { formatDuration } from '@/utils/formatDuration';

export default function HistoryPage() {
  const { data: sessions, isLoading } = useGetUserSessions();
  const { data: stats } = useGetStats();

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Session History</h2>
        <p className="text-sm text-gray-400 mt-1">All your completed study sessions</p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Sessions', value: stats.totalSessions },
            { label: 'Total Hours', value: `${stats.totalHours}h ${stats.totalMinutes % 60}m` },
            { label: 'Longest Session', value: formatDuration(stats.longestSession * 60) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      <SessionList sessions={sessions} isLoading={isLoading} />
    </div>
  );
}
