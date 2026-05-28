'use client';
import { create } from 'zustand';

interface Participant {
  _id: string;
  name: string;
  avatar?: string;
}

interface TimerState {
  isRunning: boolean;
  elapsed: number;
  startedAt: number | null;
  sessionId: string | null;
}

interface RoomStore {
  activeRoomId: string | null;
  participants: Participant[];
  timer: TimerState;
  setActiveRoom: (id: string) => void;
  clearActiveRoom: () => void;
  setParticipants: (p: Participant[]) => void;
  addParticipant: (p: Participant) => void;
  removeParticipant: (userId: string) => void;
  startTimer: (payload: { startedAt: number; sessionId: string }) => void;
  pauseTimer: (elapsed: number) => void;
  resumeTimer: (startedAt: number) => void;
  syncTimer: (payload: { isRunning: boolean; elapsed: number; startedAt?: number }) => void;
  resetTimer: () => void;
}

const defaultTimer: TimerState = { isRunning: false, elapsed: 0, startedAt: null, sessionId: null };

export const useRoomStore = create<RoomStore>((set) => ({
  activeRoomId: null,
  participants: [],
  timer: defaultTimer,

  setActiveRoom: (id) => set({ activeRoomId: id }),
  clearActiveRoom: () => set({ activeRoomId: null, participants: [], timer: defaultTimer }),

  setParticipants: (participants) => set({ participants }),
  addParticipant: (p) => set((s) => ({
    participants: s.participants.some((x) => x._id === p._id) ? s.participants : [...s.participants, p],
  })),
  removeParticipant: (userId) => set((s) => ({
    participants: s.participants.filter((p) => p._id !== userId),
  })),

  startTimer: ({ startedAt, sessionId }) =>
    set({ timer: { isRunning: true, elapsed: 0, startedAt, sessionId } }),

  pauseTimer: (elapsed) =>
    set((s) => ({ timer: { ...s.timer, isRunning: false, elapsed } })),

  resumeTimer: (startedAt) =>
    set((s) => ({ timer: { ...s.timer, isRunning: true, startedAt } })),

  syncTimer: ({ isRunning, elapsed, startedAt }) =>
    set((s) => ({ timer: { ...s.timer, isRunning, elapsed, startedAt: startedAt ?? s.timer.startedAt } })),

  resetTimer: () => set({ timer: defaultTimer }),
}));
