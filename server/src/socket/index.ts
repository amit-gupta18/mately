import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { IncomingMessage } from 'http';
import cookieParser from 'cookie-parser';
import { registerRoomHandlers } from './roomHandlers';
import { registerChatHandlers } from './chatHandlers';
import { registerTimerHandlers } from './timerHandlers';

interface AuthSocket extends Socket {
  data: { user: { id: string; name?: string } };
}

// Parse cookies from the raw upgrade request
const parseCookies = (req: IncomingMessage): Record<string, string> => {
  const raw = req.headers.cookie ?? '';
  return Object.fromEntries(
    raw.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
};

export const initSocket = (io: Server): void => {
  const study = io.of('/study');

  study.use((socket: AuthSocket, next) => {
    const cookies = parseCookies(socket.request);
    const token = cookies['token'];

    if (!token) return next(new Error('Unauthorized'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error('Token invalid'));
    }
  });

  study.on('connection', (socket: AuthSocket) => {
    console.log(`Socket connected: ${socket.id} user: ${socket.data.user.id}`);

    registerRoomHandlers(study, socket);
    registerChatHandlers(study, socket);
    registerTimerHandlers(study, socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
