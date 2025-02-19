import { Request, Response } from 'express';
import { publicClient } from '../utils/client';
import { encodeFunctionData, isAddress } from 'viem';
import { config, FactoryABI, PairABI, TokenABI } from '../config';

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

export const getReserves = async (req: Request, res: Response) => {
    try {
        const { pairAddress } = req.body;
        if (!isAddress(pairAddress)) {
            return res.status(400).json({ error: 'Invalid pair address provided' });
        }

        const reserves = await publicClient.readContract({
            address: pairAddress,
            abi: PairABI,
            functionName: 'getReserves',
            args: []
        });
        const convertedReserves = (reserves as any[]).map((r: any) => BigInt(r).toString());

        res.json({ reserves: convertedReserves });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
};

// Added new function getReservesForTokens to get reserves for two tokens
export const getReservesForTokens = async (req: Request, res: Response) => {
    try {
        const { tokenA, tokenB } = req.body;
        if (!isAddress(tokenA) || !isAddress(tokenB)) {
            return res.status(400).json({ error: 'Invalid token addresses provided' });
        }
        if (tokenA.toLowerCase() === tokenB.toLowerCase()) {
            return res.status(400).json({ error: 'Token addresses must be different' });
        }

        // Retrieve pair address from the factory
        const pairAddress = await publicClient.readContract({
            address: config.factoryAddress,
            abi: FactoryABI,
            functionName: 'getPair',
            args: [tokenA, tokenB]
        }) as `0x${string}`;

        if (pairAddress === '0x0000000000000000000000000000000000000000') {
            return res.status(400).json({ error: 'Pair does not exist' });
        }

        // Get reserves using the Pair contract
        const reserves = await publicClient.readContract({
            address: pairAddress,
            abi: PairABI,
            functionName: 'getReserves',
            args: []
        });

        const convertedReserves = (reserves as any[]).map((r: any) => BigInt(r).toString());
        return res.json({ reserves: convertedReserves });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        } else {
            return res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
};

// New controller function to fetch all pools info
export const getAllPoolsInfo = async (req: Request, res: Response) => {
    try {
        // Get the total number of pairs from the factory
        const pairCount = (await publicClient.readContract({
            address: config.factoryAddress,
            abi: FactoryABI,
            functionName: 'allPairsLength',
            args: []
        })) as bigint;

        const numPairs = Number(pairCount);
        const pools = [];

        // Iterate through all pairs
        for (let i = 0; i < numPairs; i++) {
            const pairAddress = await publicClient.readContract({
                address: config.factoryAddress,
                abi: FactoryABI,
                functionName: 'allPairs',
                args: [i]
            }) as `0x${string}`;

            // Fetch reserves for the pair
            const reserves = (await publicClient.readContract({
                address: pairAddress,
                abi: PairABI,
                functionName: 'getReserves',
                args: []
            })) as [string, string, string];

            const reserve0 = BigInt(reserves[0]);
            const reserve1 = BigInt(reserves[1]);

            // Compute token price ratio (price of token0 in terms of token1)
            let tokenPrice = "0";
            if (reserve0 > 0n) {
                tokenPrice = (Number(reserve1) / Number(reserve0)).toString();
            }

            // Compute liquidity as geometric mean of the reserves
            const liquidity = Math.sqrt(Number(reserve0) * Number(reserve1)).toString();

            // Fetch token addresses from the pair contract
            const token0Address = await publicClient.readContract({
                address: pairAddress,
                abi: PairABI,
                functionName: 'token0',
                args: []
            }) as `0x${string}`;
            const token1Address = await publicClient.readContract({
                address: pairAddress,
                abi: PairABI,
                functionName: 'token1',
                args: []
            }) as `0x${string}`;

            // Fetch token details for token0
            const token0Name = await publicClient.readContract({
                address: token0Address,
                abi: TokenABI,
                functionName: 'name',
                args: []
            });
            const token0Symbol = await publicClient.readContract({
                address: token0Address,
                abi: TokenABI,
                functionName: 'symbol',
                args: []
            });

            // Fetch token details for token1
            const token1Name = await publicClient.readContract({
                address: token1Address,
                abi: TokenABI,
                functionName: 'name',
                args: []
            });
            const token1Symbol = await publicClient.readContract({
                address: token1Address,
                abi: TokenABI,
                functionName: 'symbol',
                args: []
            });

            pools.push({
                pair: pairAddress,
                reserves: reserves.toString(),
                tokenPrice: tokenPrice.toString(),
                liquidity: liquidity.toString(),
                token0: {
                    address: token0Address,
                    name: token0Name,
                    symbol: token0Symbol
                },
                token1: {
                    address: token1Address,
                    name: token1Name,
                    symbol: token1Symbol
                }
            });
        }

        return res.json({ pools });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Unknown error occurred' });
    }
};
