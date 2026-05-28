import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/lib/constants';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      path: '/socket.io',
    });
  }
  return socket;
};

export const connectSocket = (): void => {
  getSocket().connect();
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
