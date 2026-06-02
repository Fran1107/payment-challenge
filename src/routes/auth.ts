import { Router } from 'express';
import { authRules, validateAuth } from '../validators/auth';
import { getToken } from '../controllers/auth';

const router: Router = Router();

router.post('/token', authRules, validateAuth, getToken);

export default router;