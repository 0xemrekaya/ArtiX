import { Router } from 'express';
import { createPair, getReserves, getReservesForTokens, getAllPoolsInfo } from '../controllers/poolController';

const router = Router();

router.post('/create', createPair);
router.post('/reserves', getReserves);
router.post('/reserves-for-tokens', getReservesForTokens);
router.get('/all', getAllPoolsInfo);
export default router;
