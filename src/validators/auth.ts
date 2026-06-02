import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const authRules = [
  body('client_id').notEmpty().withMessage('client_id is required').isString(),
  body('client_secret').notEmpty().withMessage('client_secret is required').isString(),
];

export const validateAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: errors.array()[0].msg });
    return;
  }
  next();
};