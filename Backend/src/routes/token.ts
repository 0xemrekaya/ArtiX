import { Router } from 'express';
import { getTokenBalance, calculatePriceImpact, getLiquidityPosition } from '../controllers/tokenController';

const router = Router();

/**
 * @route   GET /api/token/balance/:tokenAddress
 * @desc    Get token balance for a specific address
 * @param   tokenAddress - The address of the ERC20 token contract
 * @query   address - The wallet address to check balance for
 * @access  Public
 * @example GET /api/token/balance/0x123...?address=0x456...    
 */
router.get('/balance/:tokenAddress', getTokenBalance);

/**
 * @route   POST /api/token/price-impact
 * @desc    Calculate price impact for a token swap
 * @body    { tokenInAddress, tokenOutAddress, amountIn }
 * @access  Public
 */
router.post('/price-impact', calculatePriceImpact);

/**
 * @route   GET /api/token/liquidity-position/:pairAddress
 * @desc    Get position details for a liquidity provider
 * @param   pairAddress - The address of the liquidity pair contract
 * @query   address - The wallet address to check position for
 * @access  Public
 * @example GET /api/token/liquidity-position/0x789...?address=0x456...
 */
router.get('/liquidity-position/:pairAddress', getLiquidityPosition);

export default router;
