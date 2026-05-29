'use client';
import { useEffect, useState } from 'react';
import { useRoomStore } from '@/store/roomStore';
import { formatTimer } from '@/utils/formatDuration';

export const StudyTimer = () => {
  const { timer } = useRoomStore();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    setDisplay(timer.elapsed);
    if (!timer.isRunning || !timer.startedAt) return;
    const startMs = typeof timer.startedAt === 'number' ? timer.startedAt : Number(timer.startedAt);
    const tick = setInterval(() => {
      setDisplay(Math.floor((Date.now() - startMs) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [timer.isRunning, timer.startedAt, timer.elapsed]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-2xl border-2 border-brand-black bg-brand-yellow px-10 py-6 shadow-[4px_4px_0px_#0A0A0A]">
        <span className="font-mono text-5xl font-black tabular-nums text-brand-black tracking-tight">
          {formatTimer(display)}
        </span>
      </div>
      <span className={`text-xs font-bold uppercase tracking-widest ${timer.isRunning ? 'text-green-600' : 'text-brand-black/40'}`}>
        {timer.isRunning ? '● Recording' : display > 0 ? '⏸ Paused' : 'Not started'}
      </span>
    </div>
  );
};
