import { Request, Response } from 'express';
import { publicClient, walletClient } from '../utils/client';
import { parseUnits, encodeFunctionData } from 'viem';
import { config, FactoryABI, RouterABI, WETHABI } from '../config';
import { SwapType } from '../middleware/swapMiddleware';

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

export const executeSwap = async (req: Request, res: Response) => {
    try {
        const { amountIn, amountOutMin, path, deadline, swapType } = req.body;

        let txData;
        const value = swapType === 'ETH_TO_TOKEN' ? parseUnits(amountIn, 18) : 0n;

        switch (swapType as SwapType) {
            case 'ETH_TO_TOKEN':
                txData = encodeFunctionData({
                    abi: RouterABI,
                    functionName: 'swapExactETHForTokens',
                    args: [
                        parseUnits(amountOutMin, 18),
                        path,
                        req.body.to,
                        BigInt(deadline)
                    ]
                });
                break;

            case 'TOKEN_TO_ETH':
                txData = encodeFunctionData({
                    abi: RouterABI,
                    functionName: 'swapExactTokensForETH',
                    args: [
                        parseUnits(amountIn, 18),
                        parseUnits(amountOutMin, 18),
                        path,
                        req.body.to,
                        BigInt(deadline)
                    ]
                });
                break;

            case 'TOKEN_TO_TOKEN':
                txData = encodeFunctionData({
                    abi: RouterABI,
                    functionName: 'swapExactTokensForTokens',
                    args: [
                        parseUnits(amountIn, 18),
                        parseUnits(amountOutMin, 18),
                        path,
                        req.body.to,
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
            value: value
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
};
