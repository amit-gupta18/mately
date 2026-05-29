'use client';
import { useState } from 'react';
import { useRoomStore } from '@/store/roomStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface Props {
  emitStart: () => void;
  emitPause: () => void;
  emitResume: () => void;
  emitEnd: () => void;
}

export const TimerControls = ({ emitStart, emitPause, emitResume, emitEnd }: Props) => {
  const { timer } = useRoomStore();
  const [confirmEnd, setConfirmEnd] = useState(false);

  if (!timer.sessionId && !timer.isRunning) {
    return <Button onClick={emitStart} size="lg">▶ Start Session</Button>;
  }

  return (
    <>
      <div className="flex gap-2">
        {timer.isRunning
          ? <Button variant="secondary" onClick={emitPause}>⏸ Pause</Button>
          : <Button onClick={emitResume}>▶ Resume</Button>
        }
        <Button variant="danger" onClick={() => setConfirmEnd(true)}>■ End</Button>
      </div>

      <Modal isOpen={confirmEnd} onClose={() => setConfirmEnd(false)} title="End Session?">
        <p className="text-sm text-brand-black/60 mb-5">This will save the session and notify all participants.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setConfirmEnd(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => { emitEnd(); setConfirmEnd(false); }}>End Session</Button>
        </div>
      </Modal>
    </>
  );
};
