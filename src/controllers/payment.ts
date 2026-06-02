import { Request, Response } from 'express';
import { getPaginatedPayments, processPayment } from '../services/payment';
import { ChargeRequestBody } from '../types';
import { getPaymentById } from '../services/payment';

export const charge = async (
  req: Request<{}, {}, ChargeRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const result = await processPayment(req.body);

    // Input validation error (400)
    if ('httpStatus' in result) {
      res.status(400).json({ error: result.error, message: result.message });
      return;
    }

    res.status(200).json({
      transaction_id: result.transaction_id,
      reference:      result.reference,
      status:         result.status,
      decline_reason: result.decline_reason,
      card_brand:     result.card_brand,
      card_number:    result.card_number,
      amount:         result.amount,
      currency:       result.currency,
      created_at:     result.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
}

export const getPayment = async (
  req: Request<{ transaction_id: string }>,
  res: Response
): Promise<void> => {
  try {
    const doc = await getPaymentById(req.params.transaction_id);

    if (!doc) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Transaction not found' });
      return;
    }

    res.status(200).json({
      transaction_id: doc.transaction_id,
      reference:      doc.reference,
      status:         doc.status,
      decline_reason: doc.decline_reason,
      card_brand:     doc.card_brand,
      card_number:    doc.card_number,
      amount:         doc.amount,
      currency:       doc.currency,
      created_at:     doc.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

export const listPayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Leemos page y limit de la URL, con valores por defecto 1 y 10
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const { data, total } = await getPaginatedPayments(page, limit);

    res.status(200).json({
      data: data.map(doc => ({
        transaction_id: doc.transaction_id,
        reference: doc.reference,
        status: doc.status,
        amount: doc.amount,
        currency: doc.currency,
        created_at: doc.created_at
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
}