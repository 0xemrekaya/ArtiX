import { Router } from 'express';
import { createPair } from '../controllers/poolController';

const router = Router();

router.post('/create', createPair);

export default router;
