import { Response } from 'express';
import Room from '../models/Room';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

export const getRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  const rooms = await Room.find({
    $or: [{ isPrivate: false }, { participants: req.userId }, { owner: req.userId }],
  })
    .populate('owner', 'name avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, rooms });
};

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, isPrivate, maxParticipants } = req.body as {
    name: string;
    description?: string;
    isPrivate?: boolean;
    maxParticipants?: number;
  };

  if (!name) {
    res.status(400).json({ success: false, message: 'Room name is required' });
    return;
  }

  const room = await Room.create({
    name,
    description,
    isPrivate: isPrivate ?? false,
    maxParticipants: maxParticipants ?? 20,
    owner: req.userId,
    participants: [req.userId],
  });

  await room.populate('owner', 'name avatar');

  res.status(201).json({ success: true, room });
};

export const getRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  const room = await Room.findById(req.params.id)
    .populate('owner', 'name avatar')
    .populate('participants', 'name avatar');

  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  if (room.isPrivate) {
    const userId = req.userId!;
    const isAllowed =
      String(room.owner._id) === userId ||
      room.participants.some((p) => String(p._id) === userId) ||
      room.invitedUsers.some((u) => String(u) === userId);

    if (!isAllowed) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }
  }

  res.json({ success: true, room });
};

export const updateRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  if (String(room.owner) !== req.userId) {
    res.status(403).json({ success: false, message: 'Only the owner can update this room' });
    return;
  }

  const { name, description, isPrivate, maxParticipants } = req.body as Partial<{
    name: string;
    description: string;
    isPrivate: boolean;
    maxParticipants: number;
  }>;

  if (name !== undefined) room.name = name;
  if (description !== undefined) room.description = description;
  if (isPrivate !== undefined) room.isPrivate = isPrivate;
  if (maxParticipants !== undefined) room.maxParticipants = maxParticipants;

  await room.save();
  res.json({ success: true, room });
};

export const deleteRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  if (String(room.owner) !== req.userId) {
    res.status(403).json({ success: false, message: 'Only the owner can delete this room' });
    return;
  }

  await room.deleteOne();
  res.json({ success: true, message: 'Room deleted' });
};

export const inviteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };

  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required' });
    return;
  }

  const room = await Room.findById(req.params.id);
  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  if (String(room.owner) !== req.userId) {
    res.status(403).json({ success: false, message: 'Only the owner can invite users' });
    return;
  }

  const invitee = await User.findOne({ email });
  if (!invitee) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const alreadyInvited = room.invitedUsers.some((u) => String(u) === String(invitee._id));
  if (!alreadyInvited) {
    room.invitedUsers.push(invitee._id);
    await room.save();
  }

  res.json({ success: true, message: 'User invited' });
};
