import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { isAddress } from 'viem';

export type SwapType = 'TOKEN_TO_TOKEN' | 'ETH_TO_TOKEN' | 'TOKEN_TO_ETH';

export const validateSwapInput = (req: Request, res: Response, next: NextFunction) => {
    const { amountIn, amountOutMin, path, deadline } = req.body;

    if (!amountIn || isNaN(Number(amountIn)) || Number(amountIn) <= 0) {
        return res.status(400).json({ error: 'Invalid amountIn provided' });
    }

    if (!amountOutMin || isNaN(Number(amountOutMin)) || Number(amountOutMin) < 0) {
        return res.status(400).json({ error: 'Invalid amountOutMin provided' });
    }

    if (!deadline || isNaN(Number(deadline))) {
        return res.status(400).json({ error: 'Invalid deadline provided' });
    }

    if (!Array.isArray(path) || path.length < 2) {
        return res.status(400).json({ error: 'Invalid path provided' });
    }

    // Validate all addresses in path
    for (const address of path) {
        if (!isAddress(address)) {
            return res.status(400).json({ error: `Invalid address in path: ${address}` });
        }
    }

    next();
};

export const determineSwapType = (req: Request, res: Response, next: NextFunction) => {
    const { path } = req.body;

    if (!Array.isArray(path) || path.length < 2) {
        return res.status(400).json({ error: 'Invalid path provided' });
    }

    const firstToken = path[0].toLowerCase();
    const lastToken = path[path.length - 1].toLowerCase();

    if (firstToken === config.WETH.toLowerCase()) {
        req.body.swapType = 'ETH_TO_TOKEN';
    } else if (lastToken === config.WETH.toLowerCase()) {
        req.body.swapType = 'TOKEN_TO_ETH';
    } else {
        req.body.swapType = 'TOKEN_TO_TOKEN';
    }

    next();
};
