export interface Session {
  _id: string;
  room: { _id: string; name: string };
  startedBy: { _id: string; name: string; avatar?: string };
  startedAt: string;
  endedAt?: string;
  duration?: number;
  participants: { _id: string; name: string; avatar?: string }[];
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
}

export interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  totalHours: number;
  currentStreak: number;
  longestSession: number;
}
