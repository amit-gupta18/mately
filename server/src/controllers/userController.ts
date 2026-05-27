import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

export const searchUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const q = (req.query.q as string)?.trim();

  if (!q) {
    res.status(400).json({ success: false, message: 'Query param "q" is required' });
    return;
  }

  const user = await User.findOne({ email: q }).select('_id name email avatar');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({ success: true, user });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, avatar } = req.body as { name?: string; avatar?: string };

  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (name !== undefined) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  res.json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar },
  });
};
