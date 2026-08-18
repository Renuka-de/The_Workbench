import jwt from 'jsonwebtoken';
import type { JwtPayload, Role } from '../types/auth.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'development-secret';

export const signToken = (userId: string, role: Role) =>
  jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });

export const verifyToken = (token: string): JwtPayload => {
  const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
  return payload;
};
