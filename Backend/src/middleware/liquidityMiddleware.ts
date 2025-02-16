import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { isAddress } from 'viem';

export type LiquidityType = 'ADD_ETH' | 'ADD_TOKEN' | 'REMOVE_ETH' | 'REMOVE_TOKEN';

export const validateLiquidityInput = (req: Request, res: Response, next: NextFunction) => {
    const { tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, deadline } = req.body;

    if (!isAddress(tokenA) || !isAddress(tokenB)) {
        return res.status(400).json({ error: 'Invalid token addresses provided' });
    }

    if (tokenA.toLowerCase() === tokenB.toLowerCase()) {
        return res.status(400).json({ error: 'Token addresses must be different' });
    }

    if (!amountADesired || isNaN(Number(amountADesired)) || Number(amountADesired) <= 0) {
        return res.status(400).json({ error: 'Invalid amountADesired provided' });
    }

    if (!amountBDesired || isNaN(Number(amountBDesired)) || Number(amountBDesired) <= 0) {
        return res.status(400).json({ error: 'Invalid amountBDesired provided' });
    }

    if (!amountAMin || isNaN(Number(amountAMin)) || Number(amountAMin) < 0) {
        return res.status(400).json({ error: 'Invalid amountAMin provided' });
    }

    if (!amountBMin || isNaN(Number(amountBMin)) || Number(amountBMin) < 0) {
        return res.status(400).json({ error: 'Invalid amountBMin provided' });
    }

    if (!deadline || isNaN(Number(deadline))) {
        return res.status(400).json({ error: 'Invalid deadline provided' });
    }

    next();
};

export const determineLiquidityType = (req: Request, res: Response, next: NextFunction) => {
    const { tokenA, tokenB } = req.body;
    const method = req.path.includes('add') ? 'ADD' : 'REMOVE';

    if (!tokenA || !tokenB) {
        return res.status(400).json({ error: 'Token addresses are required' });
    }

    const isETHInvolved = [tokenA.toLowerCase(), tokenB.toLowerCase()].includes(config.WETH.toLowerCase());

    req.body.liquidityType = `${method}_${isETHInvolved ? 'ETH' : 'TOKEN'}` as LiquidityType;
    
    next();
};
