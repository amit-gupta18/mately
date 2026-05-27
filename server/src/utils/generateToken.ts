import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateTokenAndSetCookie = (res: Response, userId: string): void => {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'];

  const token = jwt.sign({ id: userId }, secret, { expiresIn });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
