import { Router } from 'express';
import { getAmountsOut, getPair, executeSwap } from '../controllers/swapController';
import { determineSwapType, validateSwapInput } from '../middleware/swapMiddleware';

const router = Router();

router.post('/getAmountsOut', validateSwapInput, getAmountsOut);
router.get('/getPair/:token0/:token1', getPair);
router.post('/swap', validateSwapInput, determineSwapType, executeSwap);

export default router;
