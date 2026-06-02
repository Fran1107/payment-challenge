import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/token';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  try {
    verifyToken(authHeader.split(' ')[1]);
    next();
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED' });
  }
};