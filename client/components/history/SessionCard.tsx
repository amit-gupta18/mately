import { Session } from '@/types/session';
import { formatDuration } from '@/utils/formatDuration';
import { formatDate } from '@/utils/formatDate';

export const SessionCard = ({ session }: { session: Session }) => (
  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
    <div className="flex flex-col gap-0.5">
      <p className="font-medium text-gray-900">{session.room?.name ?? 'Unknown Room'}</p>
      <p className="text-sm text-gray-400">{formatDate(session.startedAt)} · {session.participants.length} participants</p>
    </div>
    <div className="text-right">
      <p className="font-semibold text-indigo-600">{session.duration != null ? formatDuration(session.duration) : '—'}</p>
      <p className="text-xs text-gray-400 capitalize">{session.status}</p>
    </div>
  </div>
);
