import { Request, Response } from 'express';
import { publicClient } from '../utils/client';
import { parseUnits, encodeFunctionData } from 'viem';
import { config, RouterABI } from '../config';
import { LiquidityType } from '../middleware/liquidityMiddleware';

export const addLiquidity = async (req: Request, res: Response) => {
    try {
        const {
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            to,
            deadline,
            liquidityType
        } = req.body;

        let txData;
        let value = 0n;

        if (liquidityType === 'ADD_ETH') {
            const ethToken = tokenA.toLowerCase() === config.WETH.toLowerCase() ? tokenB : tokenA;
            const ethAmount = tokenA.toLowerCase() === config.WETH.toLowerCase() ? amountADesired : amountBDesired;
            const tokenAmount = tokenA.toLowerCase() === config.WETH.toLowerCase() ? amountBDesired : amountADesired;
            const tokenAmountMin = tokenA.toLowerCase() === config.WETH.toLowerCase() ? amountBMin : amountAMin;
            const ethAmountMin = tokenA.toLowerCase() === config.WETH.toLowerCase() ? amountAMin : amountBMin;

            value = parseUnits(ethAmount, 18);
            txData = encodeFunctionData({
                abi: RouterABI,
                functionName: 'addLiquidityETH',
                args: [
                    ethToken,
                    parseUnits(tokenAmount, 18),
                    parseUnits(tokenAmountMin, 18),
                    parseUnits(ethAmountMin, 18),
                    to,
                    BigInt(deadline)
                ]
            });
        } else {
            txData = encodeFunctionData({
                abi: RouterABI,
                functionName: 'addLiquidity',
                args: [
                    tokenA,
                    tokenB,
                    parseUnits(amountADesired, 18),
                    parseUnits(amountBDesired, 18),
                    parseUnits(amountAMin, 18),
                    parseUnits(amountBMin, 18),
                    to,
                    BigInt(deadline)
                ]
            });
        }

        res.json({
            to: config.routerAddress,
            data: txData,
            value
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
};

export const removeLiquidity = async (req: Request, res: Response) => {
    try {
        const {
            tokenA,
            tokenB,
            liquidity,
            amountAMin,
            amountBMin,
            to,
            deadline,
            liquidityType
        } = req.body;

        let txData;

        if (liquidityType === 'REMOVE_ETH') {
            const token = tokenA.toLowerCase() === config.WETH.toLowerCase() ? tokenB : tokenA;
            const tokenAmountMin = tokenA.toLowerCase() === config.WETH.toLowerCase() ? amountBMin : amountAMin;
            const ethAmountMin = tokenA.toLowerCase() === config.WETH.toLowerCase() ? amountAMin : amountBMin;

            txData = encodeFunctionData({
                abi: RouterABI,
                functionName: 'removeLiquidityETH',
                args: [
                    token,
                    parseUnits(liquidity, 18),
                    parseUnits(tokenAmountMin, 18),
                    parseUnits(ethAmountMin, 18),
                    to,
                    BigInt(deadline)
                ]
            });
        } else {
            txData = encodeFunctionData({
                abi: RouterABI,
                functionName: 'removeLiquidity',
                args: [
                    tokenA,
                    tokenB,
                    parseUnits(liquidity, 18),
                    parseUnits(amountAMin, 18),
                    parseUnits(amountBMin, 18),
                    to,
                    BigInt(deadline)
                ]
            });
        }

        res.json({
            to: config.routerAddress,
            data: txData,
            value: 0n
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
};
