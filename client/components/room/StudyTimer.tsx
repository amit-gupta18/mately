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
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-5xl font-bold tabular-nums text-gray-900">
        {formatTimer(display)}
      </span>
      <span className="text-xs text-gray-400">
        {timer.isRunning ? '● Recording' : display > 0 ? 'Paused' : 'Not started'}
      </span>
    </div>
  );
};
