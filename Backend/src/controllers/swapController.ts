import { Request, Response } from 'express';
import { publicClient } from '../utils/client';
import { parseUnits } from 'viem';
import { config, FactoryABI, RouterABI, WETHABI } from '../config';

export const getAmountsOut = async (req: Request, res: Response) => {
    try {
        const { amountIn, path } = req.body;

        const amounts = await publicClient.readContract({
            address: config.routerAddress,
            abi: RouterABI,
            functionName: 'getAmountsOut',
            args: [parseUnits(amountIn, 18), path]
        });

        res.json({ amounts });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
};

export const getPair = async (req: Request, res: Response) => {
    try {
        const { token0, token1 } = req.params;

        const pair = await publicClient.readContract({
            address: config.factoryAddress,
            abi: FactoryABI,
            functionName: 'getPair',
            args: [token0, token1]
        });

        res.json({ pair });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
};
