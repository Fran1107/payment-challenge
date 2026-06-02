import rateLimit from 'express-rate-limit';

export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // máximo 10 requests por IP en esa ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many payment attempts, please try again later.',
  },
})