import { Response } from 'express';
import Session from '../models/Session';
import { AuthRequest } from '../middleware/authMiddleware';

export const getUserSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  const sessions = await Session.find({ startedBy: req.userId, status: 'completed' })
    .populate('room', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, sessions });
};

export const getRoomSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  const sessions = await Session.find({ room: req.params.roomId, status: 'completed' })
    .populate('startedBy', 'name avatar')
    .populate('participants', 'name avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, sessions });
};

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const sessions = await Session.find({ startedBy: req.userId, status: 'completed' });

  const totalSessions = sessions.length;
  const totalMinutes = Math.floor(
    sessions.reduce((acc, s) => acc + (s.duration ?? 0), 0) / 60
  );
  const totalHours = Math.floor(totalMinutes / 60);
  const longestSession = Math.max(0, ...sessions.map((s) => Math.floor((s.duration ?? 0) / 60)));

  // simple streak: consecutive days with at least one session
  const days = new Set(
    sessions.map((s) => s.startedAt.toISOString().slice(0, 10))
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(d.toISOString().slice(0, 10))) {
      streak++;
    } else {
      break;
    }
  }

  res.json({
    success: true,
    data: { totalSessions, totalMinutes, totalHours, currentStreak: streak, longestSession },
  });
};
