import { Request, Response } from 'express';
import { publicClient, walletClient } from '../utils/client';
import { config, FactoryABI } from '../config';

export const createPair = async (req: Request, res: Response) => {
    try {
        const { tokenA, tokenB } = req.body;

        const { request } = await publicClient.simulateContract({
            address: config.factoryAddress,
            abi: FactoryABI,
            functionName: 'createPair',
            args: [tokenA, tokenB]
        });

        const hash = await walletClient.writeContract(request);
        res.json({ hash });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
};
