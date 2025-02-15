import { Router } from 'express';
import { getAmountsOut, getPair } from '../controllers/swapController';

const router = Router();

router.post('/amounts-out', getAmountsOut);
router.get('/pair/:token0/:token1', getPair);

export default router;
