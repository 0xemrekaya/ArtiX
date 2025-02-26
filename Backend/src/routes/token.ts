import { Router } from 'express';
import { getTokenBalance, calculatePriceImpact, getLiquidityPosition } from '../controllers/tokenController';

const router = Router();

/**
 * @route   GET /api/token/balance/:tokenAddress/:ownerAddress?
 * @desc    Get token balance for a specific address
 * @query   address - Alternative way to specify owner address
 * @access  Public
 */
router.get('/balance/:tokenAddress/:ownerAddress?', getTokenBalance);

/**
 * @route   POST /api/token/price-impact
 * @desc    Calculate price impact for a token swap
 * @body    { tokenInAddress, tokenOutAddress, amountIn }
 * @access  Public
 */
router.post('/price-impact', calculatePriceImpact);

/**
 * @route   GET /api/token/liquidity-position/:pairAddress/:userAddress?
 * @desc    Get position details for a liquidity provider
 * @query   address - Alternative way to specify user address
 * @access  Public
 */
router.get('/liquidity-position/:pairAddress/:userAddress?', getLiquidityPosition);

export default router;
