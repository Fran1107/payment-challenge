import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const paymentRules = [
  body('reference')
    .isString().isLength({ min: 6 })
    .withMessage('reference must be at least 6 characters'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('amount must be a positive number'),
  body('card.number')
    .isString().matches(/^\d+$/)
    .withMessage('card.number must contain only digits'),
  body('card.holder')
    .notEmpty().isString()
    .withMessage('card.holder is required'),
  body('card.expiry')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .withMessage('card.expiry must be MM/YY'),
  body('card.cvv')
    .matches(/^\d{3,4}$/)
    .withMessage('card.cvv must be 3 or 4 digits'),
  body('currency')
    .optional().isLength({ min: 3, max: 3 })
    .withMessage('currency must be ISO 4217'),
]

export const validatePayment = (
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
}