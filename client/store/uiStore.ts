'use client';
import { create } from 'zustand';

interface UIStore {
  isCreateRoomModalOpen: boolean;
  isSessionSummaryOpen: boolean;
  lastSessionDuration: number | null;
  openCreateRoomModal: () => void;
  closeCreateRoomModal: () => void;
  openSessionSummary: (duration: number) => void;
  closeSessionSummary: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isCreateRoomModalOpen: false,
  isSessionSummaryOpen: false,
  lastSessionDuration: null,
  openCreateRoomModal: () => set({ isCreateRoomModalOpen: true }),
  closeCreateRoomModal: () => set({ isCreateRoomModalOpen: false }),
  openSessionSummary: (duration) => set({ isSessionSummaryOpen: true, lastSessionDuration: duration }),
  closeSessionSummary: () => set({ isSessionSummaryOpen: false, lastSessionDuration: null }),
}));
