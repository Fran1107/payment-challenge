import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { paymentRateLimiter } from '../middleware/ratelimiter';
import { paymentRules, validatePayment } from '../validators/payment';
import { charge, getPayment, listPayments } from '../controllers/payment';

const router: Router = Router();

router.post('/charge', authMiddleware, paymentRateLimiter, paymentRules, validatePayment, charge);
router.get('/', authMiddleware, listPayments);
router.get('/:transaction_id', authMiddleware, getPayment);

export default router;