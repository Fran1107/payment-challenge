import { Request, Response } from 'express';
import env from '../config/env';
import { signToken } from '../services/token';
import { TokenRequestBody, TokenResponse } from '../types';

export const getToken = (
  req: Request<{}, {}, TokenRequestBody>,
  res: Response
): void => {
  const { client_id, client_secret } = req.body;

  if (client_id !== env.validClientId || client_secret !== env.validClientSecret) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  const access_token = signToken({ client_id });

  const response: TokenResponse = {
    access_token,
    token_type: 'Bearer',
    expires_in: env.tokenExpiry,
  };

  res.status(200).json(response);
};