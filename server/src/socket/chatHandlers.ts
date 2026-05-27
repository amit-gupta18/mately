import { Namespace, Socket } from 'socket.io';
import Message from '../models/Message';
import User from '../models/User';

export const registerChatHandlers = (io: Namespace, socket: Socket): void => {
  const userId = (socket.data as { user: { id: string } }).user.id;

  socket.on('chat:message', async ({ roomId, text }: { roomId: string; text: string }) => {
    try {
      if (!text?.trim()) return;

      const rooms = Array.from(socket.rooms);
      if (!rooms.includes(roomId)) {
        socket.emit('error', { message: 'You are not in this room' });
        return;
      }

      const message = await Message.create({ room: roomId, sender: userId, text: text.trim() });
      await message.populate('sender', 'name avatar');

      io.to(roomId).emit('chat:message', {
        _id: message._id,
        sender: message.sender,
        text: message.text,
        createdAt: message.createdAt,
      });
    } catch {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
};
