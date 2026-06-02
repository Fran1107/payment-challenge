import dotenv from 'dotenv';
import { EnvConfig } from '../types/index';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env variable: ${key}`);
  return value;
};

const env: EnvConfig = {
  port:               parseInt(process.env.PORT ?? '3000', 10),
  jwtSecret:          required('JWT_SECRET'),
  tokenExpiry:        parseInt(process.env.TOKEN_EXPIRY_SECONDS ?? '3600', 10),
  validClientId:      required('VALID_CLIENT_ID'),
  validClientSecret:  required('VALID_CLIENT_SECRET'),
  approvedCardNumber: required('APPROVED_CARD_NUMBER'),
  mongoUri:           required('MONGODB_URI'),
};

export default env;