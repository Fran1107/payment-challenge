import { Schema, model } from 'mongoose';
import { ITransaction } from '../../types';

const transactionSchema = new Schema<ITransaction>({
  transaction_id: { type: String, required: true, unique: true },
  reference:      { type: String, required: true, unique: true, index: true },
  status:         { type: String, enum: ['approved', 'declined'], required: true },
  decline_reason: { type: String, default: null },
  amount:         { type: Number, required: true },
  currency:       { type: String, default: 'USD' },
  card_brand:     { type: String, required: true },
  card_number:    { type: String, required: true },
  card_holder:    { type: String, required: true },
  created_at:     { type: Date, default: Date.now },
});

export const Transaction = model<ITransaction>('Transaction', transactionSchema);