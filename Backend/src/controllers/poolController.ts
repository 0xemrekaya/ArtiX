import { Request, Response } from 'express';
import { publicClient } from '../utils/client';
import { encodeFunctionData, isAddress } from 'viem';
import { config, FactoryABI } from '../config';

export const createPair = async (req: Request, res: Response) => {
    try {
        const { tokenA, tokenB } = req.body;

        // Validate addresses
        if (!isAddress(tokenA) || !isAddress(tokenB)) {
            return res.status(400).json({ error: 'Invalid token addresses provided' });
        }

        // Check if addresses are the same
        if (tokenA.toLowerCase() === tokenB.toLowerCase()) {
            return res.status(400).json({ error: 'Token addresses must be different' });
        }

        // Check if pair already exists
        const existingPair = await publicClient.readContract({
            address: config.factoryAddress,
            abi: FactoryABI,
            functionName: 'getPair',
            args: [tokenA, tokenB]
        });

        if (existingPair !== '0x0000000000000000000000000000000000000000') {
            return res.status(400).json({ 
                error: 'Pair already exists',
                pair: existingPair
            });
        }

        // Prepare transaction data
        const txData = encodeFunctionData({
            abi: FactoryABI,
            functionName: 'createPair',
            args: [tokenA, tokenB]
        });

        res.json({
            to: config.factoryAddress,
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
