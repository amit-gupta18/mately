import { Request, Response } from 'express';
import User from '../models/User';
import { generateTokenAndSetCookie } from '../utils/generateToken';
import { AuthRequest } from '../middleware/authMiddleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: 'All fields are required' });
    return;
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409).json({ success: false, message: 'Email already in use' });
    return;
  }

  const user = await User.create({ name, email, password });
  generateTokenAndSetCookie(res, String(user._id));

  res.status(201).json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  generateTokenAndSetCookie(res, String(user._id));

  res.json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar },
  });
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
  res.json({ success: true, message: 'Logged out' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, user });
};
