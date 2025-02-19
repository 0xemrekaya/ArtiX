import { Request, Response } from 'express';
import { parseUnits, encodeFunctionData } from 'viem';
import { config, RouterABI } from '../config';

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
        let value = "0";

        if (liquidityType === 'ADD_ETH') {
            const ethToken = tokenA.toLowerCase() === config.WETH.toLowerCase() ? tokenB : tokenA;
            const ethAmount = tokenA.toLowerCase() === config.WETH.toLowerCase() ? amountADesired : amountBDesired;
            const tokenAmount = tokenA.toLowerCase() === config.WETH.toLowerCase() ? amountBDesired : amountADesired;
            const tokenAmountMin = tokenA.toLowerCase() === config.WETH.toLowerCase() ? amountBMin : amountAMin;
            const ethAmountMin = tokenA.toLowerCase() === config.WETH.toLowerCase() ? amountAMin : amountBMin;

            value = ethAmount;
            txData = encodeFunctionData({
                abi: RouterABI,
                functionName: 'addLiquidityETH',
                args: [
                    ethToken,
                    BigInt(tokenAmount),
                    BigInt(tokenAmountMin),
                    BigInt(ethAmountMin),
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
                    BigInt(amountADesired),
                    BigInt(amountBDesired),
                    BigInt(amountAMin),
                    BigInt(amountBMin),
                    to,
                    BigInt(deadline)
                ]
            });
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
                    BigInt(liquidity),
                    BigInt(tokenAmountMin),
                    BigInt(ethAmountMin),
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
                    BigInt(liquidity),
                    BigInt(amountAMin),
                    BigInt(amountBMin),
                    to,
                    BigInt(deadline)
                ]
            });
        }

        res.json({
            to: config.routerAddress,
            data: txData,
            value: "0"
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
};
