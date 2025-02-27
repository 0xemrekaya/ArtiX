import { Router } from 'express';
import swapRouter from './swap';
import poolRouter from './pool';
import liquidityRouter from './liquidity';
import tokenRouter from './token';
import executeRouter from './execute';

const router = Router();

router.use('/swap', swapRouter);
router.use('/pool', poolRouter);
router.use('/liquidity', liquidityRouter);
router.use('/token', tokenRouter);
router.use('/execute', executeRouter);

export default router;
