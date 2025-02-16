import { Router } from 'express';
import { addLiquidity, removeLiquidity } from '../controllers/liquidityController';
import { determineLiquidityType, validateLiquidityInput } from '../middleware/liquidityMiddleware';

const router = Router();

router.post('/add', validateLiquidityInput, determineLiquidityType, addLiquidity);
router.post('/remove', validateLiquidityInput, determineLiquidityType, removeLiquidity);

export default router;
