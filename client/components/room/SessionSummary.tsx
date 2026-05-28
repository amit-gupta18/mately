'use client';
import { useUIStore } from '@/store/uiStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/utils/formatDuration';

export const SessionSummary = () => {
  const { isSessionSummaryOpen, lastSessionDuration, closeSessionSummary } = useUIStore();
  return (
    <Modal isOpen={isSessionSummaryOpen} onClose={closeSessionSummary} title="Session Complete 🎉">
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <p className="text-gray-500 text-sm">You studied for</p>
        <p className="text-4xl font-bold text-indigo-600">
          {lastSessionDuration != null ? formatDuration(lastSessionDuration) : '—'}
        </p>
        <p className="text-sm text-gray-400">Great work! Keep it up.</p>
      </div>
      <Button className="w-full mt-2" onClick={closeSessionSummary}>Back to Room</Button>
    </Modal>
  );
};
