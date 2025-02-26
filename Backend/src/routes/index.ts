import { Router } from 'express';
import swapRouter from './swap';
import poolRouter from './pool';
import liquidityRouter from './liquidity';
import tokenRouter from './token';

const router = Router();

router.use('/swap', swapRouter);
router.use('/pool', poolRouter);
router.use('/liquidity', liquidityRouter);
router.use('/token', tokenRouter);

export default router;
