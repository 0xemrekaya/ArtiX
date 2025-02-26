import { Router } from 'express';
import { createPair, getReserves, getReservesForTokens, getAllPoolsInfo, getPoolVolume } from '../controllers/poolController';

const router = Router();

router.post('/create', createPair);
router.post('/reserves', getReserves);
router.post('/reserves-for-tokens', getReservesForTokens);
router.get('/all', getAllPoolsInfo);
router.get('/volume/:pairAddress', getPoolVolume);
export default router;
