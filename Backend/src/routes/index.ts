import { Router } from 'express';
import swapRouter from './swap';
import poolRouter from './pool';
import liquidityRouter from './liquidity';

const router = Router();

router.use('/swap', swapRouter);
router.use('/pool', poolRouter);
router.use('/liquidity', liquidityRouter);

export default router;
