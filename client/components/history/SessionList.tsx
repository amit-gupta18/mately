import { Session } from '@/types/session';
import { SessionCard } from './SessionCard';
import { Spinner } from '@/components/ui/Spinner';

interface Props { sessions?: Session[]; isLoading?: boolean }

export const SessionList = ({ sessions, isLoading }: Props) => {
  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" className="text-indigo-600" /></div>;
  if (!sessions?.length) return (
    <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
      No sessions yet. Start studying!
    </div>
  );
  return (
    <div className="flex flex-col gap-3">
      {sessions.map((s) => <SessionCard key={s._id} session={s} />)}
    </div>
  );
};
