import { Document } from 'mongoose';

// ── Auth ──────────────────────────────────────────────
export interface TokenRequestBody {
  client_id: string;
  client_secret: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

export interface JwtPayload {
  client_id: string;
}

// ── Card ──────────────────────────────────────────────
export type CardBrand = 'visa' | 'mastercard' | 'amex';

export interface CardInput {
  number: string;
  holder: string;
  expiry: string; // MM/YY
  cvv: string;
}

// ── Payment ───────────────────────────────────────────
export interface ChargeRequestBody {
  reference: string;
  amount: number;
  card: CardInput;
  currency?: string;
}

export type PaymentStatus = 'approved' | 'declined';

export type DeclineReason =
  | 'AMOUNT_BELOW_MINIMUM'
  | 'AMOUNT_EXCEEDS_LIMIT'
  | 'DUPLICATE_REFERENCE'
  | 'CARD_EXPIRED'
  | 'INVALID_CARD_NUMBER'
  | 'UNSUPPORTED_CARD_BRAND';

export interface PaymentResult {
  transaction_id: string | null;
  reference: string;
  status: PaymentStatus;
  decline_reason: DeclineReason | null;
  card_brand: CardBrand | 'unknown';
  card_number: string;
  amount: number;
  currency: string;
  created_at: Date;
  persist: boolean;
}

// Resultado interno que puede ser un error 400
export type ProcessResult =
  | PaymentResult
  | { httpStatus: 400; error: string; message: string };

// ── Mongoose Document ─────────────────────────────────
export interface ITransaction extends Document {
  transaction_id: string;
  reference: string;
  status: PaymentStatus;
  decline_reason: DeclineReason | null;
  amount: number;
  currency: string;
  card_brand: CardBrand | 'unknown';
  card_number: string;
  card_holder: string;
  created_at: Date;
}

// ── Env ───────────────────────────────────────────────
export interface EnvConfig {
  port: number;
  jwtSecret: string;
  tokenExpiry: number;
  validClientId: string;
  validClientSecret: string;
  approvedCardNumber: string;
  mongoUri: string;
}