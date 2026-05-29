import { Session } from '@/types/session';
import { formatDuration } from '@/utils/formatDuration';
import { formatDate } from '@/utils/formatDate';

export const SessionCard = ({ session }: { session: Session }) => (
  <div className="flex items-center justify-between rounded-2xl border-2 border-brand-border bg-brand-white p-4 hover:border-brand-black hover:shadow-[4px_4px_0px_#0A0A0A] transition-all">
    <div className="flex flex-col gap-0.5">
      <p className="font-black text-brand-black">{session.room?.name ?? 'Unknown Room'}</p>
      <p className="text-xs font-medium text-brand-black/40">{formatDate(session.startedAt)} · {session.participants.length} participants</p>
    </div>
    <div className="text-right">
      <p className="font-black text-brand-black">{session.duration != null ? formatDuration(session.duration) : '—'}</p>
      <p className="text-xs font-bold uppercase tracking-wide text-brand-black/40">{session.status}</p>
    </div>
  </div>
);
