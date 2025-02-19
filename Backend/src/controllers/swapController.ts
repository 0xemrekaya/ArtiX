import { Request, Response } from 'express';
import { publicClient } from '../utils/client';
import { encodeFunctionData } from 'viem';
import { config, FactoryABI, RouterABI, WETHABI } from '../config';
import { SwapType } from '../middleware/swapMiddleware';

export const getAmountsOut = async (req: Request, res: Response) => {
    try {
        const { amountIn, path } = req.body;

        const amounts = await publicClient.readContract({
            address: config.routerAddress,
            abi: RouterABI,
            functionName: 'getAmountsOut',
            args: [BigInt(amountIn), path]
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

export const executeSwap = async (req: Request, res: Response) => {
    try {
        const { amountIn, amountOutMin, path, to, deadline, swapType } = req.body;

        let txData;
        const value = swapType === 'ETH_TO_TOKEN' ? BigInt(amountIn) : 0n;

        switch (swapType as SwapType) {
            case 'ETH_TO_TOKEN':
                txData = encodeFunctionData({
                    abi: RouterABI,
                    functionName: 'swapExactETHForTokens',
                    args: [
                        BigInt(amountOutMin),
                        path,
                        to,
                        BigInt(deadline)
                    ]
                });
                break;

            case 'TOKEN_TO_ETH':
                txData = encodeFunctionData({
                    abi: RouterABI,
                    functionName: 'swapExactTokensForETH',
                    args: [
                        BigInt(amountIn),
                        BigInt(amountOutMin),
                        path,
                        to,
                        BigInt(deadline)
                    ]
                });
                break;

            case 'TOKEN_TO_TOKEN':
                txData = encodeFunctionData({
                    abi: RouterABI,
                    functionName: 'swapExactTokensForTokens',
                    args: [
                        BigInt(amountIn),
                        BigInt(amountOutMin),
                        path,
                        to,
                        BigInt(deadline)
                    ]
                });
                break;

            default:
                return res.status(400).json({ error: 'Invalid swap type' });
        }

        res.json({
            to: config.routerAddress,
            data: txData,
            value: value.toString()
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
};
