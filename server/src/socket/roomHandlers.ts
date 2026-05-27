import { Namespace, Socket } from 'socket.io';
import Room from '../models/Room';

export const registerRoomHandlers = (io: Namespace, socket: Socket): void => {
  const userId = (socket.data as { user: { id: string } }).user.id;

  socket.on('room:join', async ({ roomId }: { roomId: string }) => {
    try {
      const room = await Room.findById(roomId)
        .populate('participants', 'name avatar');

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      await socket.join(roomId);

      // Add to DB participants if not already present
      const alreadyIn = room.participants.some((p: any) => String(p._id) === userId);
      if (!alreadyIn) {
        room.participants.push(userId as any);
        await room.save();
        await room.populate('participants', 'name avatar');
      }

      // Send full participant list to the joiner
      socket.emit('room:participants_list', { participants: room.participants });

      // Notify everyone else
      const participantCount = (await io.in(roomId).fetchSockets()).length;
      socket.to(roomId).emit('room:participant_joined', {
        user: { _id: userId },
        participantCount,
      });
    } catch (err) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('room:leave', async ({ roomId }: { roomId: string }) => {
    await socket.leave(roomId);
    const participantCount = (await io.in(roomId).fetchSockets()).length;
    io.to(roomId).emit('room:participant_left', { userId, participantCount });
  });
};
