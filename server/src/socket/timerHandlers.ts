import { Namespace, Socket } from 'socket.io';
import Session from '../models/Session';

export const registerTimerHandlers = (io: Namespace, socket: Socket): void => {
  const userId = (socket.data as { user: { id: string } }).user.id;

  socket.on('timer:start', async ({ roomId }: { roomId: string }) => {
    try {
      // Abandon any existing active session for this room
      await Session.updateMany(
        { room: roomId, status: 'active' },
        { status: 'abandoned' }
      );

      const startedAt = new Date();
      await Session.create({ room: roomId, startedBy: userId, startedAt, status: 'active' });

      io.to(roomId).emit('timer:started', { startedAt: startedAt.getTime(), startedBy: userId });
    } catch {
      socket.emit('error', { message: 'Failed to start timer' });
    }
  });

  socket.on('timer:pause', async ({ roomId }: { roomId: string }) => {
    try {
      const session = await Session.findOne({ room: roomId, status: 'active' });
      if (!session) return;

      const elapsed = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
      io.to(roomId).emit('timer:paused', { elapsed });
    } catch {
      socket.emit('error', { message: 'Failed to pause timer' });
    }
  });

  socket.on('timer:end', async ({ roomId }: { roomId: string }) => {
    try {
      const session = await Session.findOne({ room: roomId, status: 'active' });
      if (!session) return;

      const endedAt = new Date();
      const duration = Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000);

      session.endedAt = endedAt;
      session.duration = duration;
      session.status = 'completed';
      await session.save();

      io.to(roomId).emit('timer:ended', { sessionId: session._id, duration });
    } catch {
      socket.emit('error', { message: 'Failed to end session' });
    }
  });

  socket.on('timer:sync_request', async ({ roomId }: { roomId: string }) => {
    try {
      const session = await Session.findOne({ room: roomId, status: 'active' });

      if (!session) {
        socket.emit('timer:sync', { elapsed: 0, isRunning: false, startedAt: null });
        return;
      }

      const elapsed = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
      socket.emit('timer:sync', { elapsed, isRunning: true, startedAt: session.startedAt.getTime() });
    } catch {
      socket.emit('error', { message: 'Failed to sync timer' });
    }
  });
};
