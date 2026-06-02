import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { paymentRules, validatePayment } from '../validators/payment';
import { charge, getPayment } from '../controllers/payment';

const router: Router = Router();

router.post('/charge', authMiddleware, paymentRules, validatePayment, charge);
router.get('/:transaction_id', authMiddleware, getPayment);

export default router;