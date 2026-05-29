'use client';
import { useUIStore } from '@/store/uiStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/utils/formatDuration';

export const SessionSummary = () => {
  const { isSessionSummaryOpen, lastSessionDuration, closeSessionSummary } = useUIStore();
  return (
    <Modal isOpen={isSessionSummaryOpen} onClose={closeSessionSummary} title="Session Complete!">
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="rounded-2xl border-2 border-brand-black bg-brand-yellow px-8 py-5 shadow-[4px_4px_0px_#0A0A0A]">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-black/60 mb-1">You studied for</p>
          <p className="text-4xl font-black text-brand-black">
            {lastSessionDuration != null ? formatDuration(lastSessionDuration) : '—'}
          </p>
        </div>
        <p className="text-sm font-medium text-brand-black/50">Great work! Keep the momentum going. 🔥</p>
      </div>
      <Button className="w-full mt-2" onClick={closeSessionSummary}>Back to Room</Button>
    </Modal>
  );
};
