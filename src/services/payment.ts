import { v4 as uuidv4 } from 'uuid';
import {
  CardBrand,
  CardInput,
  ChargeRequestBody,
  DeclineReason,
  ITransaction,
  ProcessResult,
} from '../types';
import { Transaction } from '../db/models/Transaction';
import env from '../config/env';

// ── Brand detection ───────────────────────────────────

const detectBrand = (number: string): CardBrand | null => {
  if (/^4(\d{12}|\d{15})$/.test(number)) return 'visa';
  if (/^5[1-5]\d{14}$|^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)\d{12}$/.test(number))
    return 'mastercard';
  if (/^3[47]\d{13}$/.test(number)) return 'amex';
  return null;
};

// ── PAN length validation ─────────────────────────────

const isValidPanLength = (number: string, brand: CardBrand): boolean => {
  const len = number.length;
  if (brand === 'visa')       return len === 13 || len === 16;
  if (brand === 'mastercard') return len === 16;
  if (brand === 'amex')       return len === 15;
  return false;
};

// ── Expiry validation ─────────────────────────────────

const isCardExpired = (expiry: string): boolean => {
  const [mm, yy] = expiry.split('/').map(Number);
  const expDate = new Date(2000 + yy, mm, 0); // last day of expiry month
  return expDate < new Date();
};

// ── Masking ───────────────────────────────────────────

const maskPan = (number: string): string =>
  `${number.slice(0, 6)} **** ${number.slice(-4)}`;

// ── Persist & return declined ─────────────────────────

const persistDeclined = async (
  reference: string,
  amount: number,
  currency: string,
  card: CardInput,
  brand: CardBrand | 'unknown',
  reason: DeclineReason
): Promise<ProcessResult> => {
  const doc: ITransaction = await Transaction.create({
    transaction_id: uuidv4(),
    reference,
    status: 'declined',
    decline_reason: reason,
    amount: parseFloat(amount.toFixed(2)),
    currency,
    card_brand: brand,
    card_number: maskPan(card.number),
    card_holder: card.holder,
  });

  return {
    transaction_id: doc.transaction_id,
    reference:      doc.reference,
    status:         'declined',
    decline_reason: reason,
    card_brand:     brand,
    card_number:    doc.card_number,
    amount:         doc.amount,
    currency:       doc.currency,
    created_at:     doc.created_at,
    persist:        true,
  };
};

// ── Main process ──────────────────────────────────────

export const processPayment = async (
  body: ChargeRequestBody
): Promise<ProcessResult> => {
  const { reference, card, currency = 'USD' } = body;
  const amount = parseFloat(body.amount.toFixed(2));

  // 1. Duplicate reference
  const existing = await Transaction.findOne({ reference });
  if (existing) {
    return {
      transaction_id: null,
      reference,
      status: 'declined',
      decline_reason: 'DUPLICATE_REFERENCE',
      card_brand: 'unknown',
      card_number: maskPan(card.number),
      amount,
      currency,
      created_at: new Date(),
      persist: false,
    };
  }

  // 2. Brand detection
  const brand = detectBrand(card.number);
  if (!brand)
    return persistDeclined(reference, amount, currency, card, 'unknown', 'UNSUPPORTED_CARD_BRAND');

  // 3. PAN length
  if (!isValidPanLength(card.number, brand))
    return persistDeclined(reference, amount, currency, card, brand, 'INVALID_CARD_NUMBER');

  // 4. CVV length (400 — input validation error, not business)
  const expectedCvvLen = brand === 'amex' ? 4 : 3;
  if (card.cvv.length !== expectedCvvLen)
    return { httpStatus: 400, error: 'VALIDATION_ERROR', message: `CVV must be ${expectedCvvLen} digits for ${brand}` };

  // 5. Expiry
  if (isCardExpired(card.expiry))
    return persistDeclined(reference, amount, currency, card, brand, 'CARD_EXPIRED');

  // 6. Amount rules
  if (amount < 10)
    return persistDeclined(reference, amount, currency, card, brand, 'AMOUNT_BELOW_MINIMUM');
  if (amount > 100)
    return persistDeclined(reference, amount, currency, card, brand, 'AMOUNT_EXCEEDS_LIMIT');

  // 7. Approved
  const doc: ITransaction = await Transaction.create({
    transaction_id: uuidv4(),
    reference,
    status: 'approved',
    decline_reason: null,
    amount,
    currency,
    card_brand: brand,
    card_number: maskPan(card.number),
    card_holder: card.holder,
  });

  return {
    transaction_id: doc.transaction_id,
    reference:      doc.reference,
    status:         'approved',
    decline_reason: null,
    card_brand:     brand,
    card_number:    doc.card_number,
    amount:         doc.amount,
    currency:       doc.currency,
    created_at:     doc.created_at,
    persist:        true,
  };
};