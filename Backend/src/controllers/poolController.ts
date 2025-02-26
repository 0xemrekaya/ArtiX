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
        const reserves = (await publicClient.readContract({
            address: pairAddress,
            abi: PairABI,
            functionName: 'getReserves',
            args: []
        })) as [string, string, string];

        const reserve0 = BigInt(reserves[0]).toString();
        const reserve1 = BigInt(reserves[1]).toString();

        // Fetch token details for tokenA
        const token0Name = await publicClient.readContract({
            address: tokenA,
            abi: TokenABI,
            functionName: 'name',
            args: []
        });
        const token0Symbol = await publicClient.readContract({
            address: tokenA,
            abi: TokenABI,
            functionName: 'symbol',
            args: []
        });

        // Fetch token details for tokenB
        const token1Name = await publicClient.readContract({
            address: tokenB,
            abi: TokenABI,
            functionName: 'name',
            args: []
        });
        const token1Symbol = await publicClient.readContract({
            address: tokenB,
            abi: TokenABI,
            functionName: 'symbol',
            args: []
        });

        return res.json({
            pairAddress,
            poolData: {
                token0: {
                    address: tokenA,
                    name: token0Name,
                    symbol: token0Symbol,
                    reserve: reserve0
                },
                token1: {
                    address: tokenB,
                    name: token1Name,
                    symbol: token1Symbol,
                    reserve: reserve1
                }
            }
        });
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
                pairAddress,
                poolData: {
                    token0: {
                        address: token0Address,
                        name: token0Name,
                        symbol: token0Symbol,
                        reserve: reserve0.toString()
                    },
                    token1: {
                        address: token1Address,
                        name: token1Name,
                        symbol: token1Symbol,
                        reserve: reserve1.toString()
                    },
                    metrics: {
                        tokenPrice,
                        liquidity
                    }
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

// Function to get pool trading volume and recent swaps
export const getPoolVolume = async (req: Request, res: Response) => {
    try {
        const { pairAddress } = req.params;
        
        if (!isAddress(pairAddress)) {
            return res.status(400).json({ error: 'Invalid pair address provided' });
        }

        // Get token addresses
        const token0Address = await publicClient.readContract({
            address: pairAddress as `0x${string}`,
            abi: PairABI,
            functionName: 'token0',
            args: []
        }) as `0x${string}`;

        const token1Address = await publicClient.readContract({
            address: pairAddress as `0x${string}`,
            abi: PairABI,
            functionName: 'token1',
            args: []
        }) as `0x${string}`;

        // Get token details
        const [token0Name, token0Symbol, token1Name, token1Symbol] = await Promise.all([
            publicClient.readContract({
                address: token0Address,
                abi: TokenABI,
                functionName: 'name',
                args: []
            }),
            publicClient.readContract({
                address: token0Address,
                abi: TokenABI,
                functionName: 'symbol',
                args: []
            }),
            publicClient.readContract({
                address: token1Address,
                abi: TokenABI,
                functionName: 'name',
                args: []
            }),
            publicClient.readContract({
                address: token1Address,
                abi: TokenABI,
                functionName: 'symbol',
                args: []
            })
        ]);

        // Get recent swap events (last 100 blocks)
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - BigInt(100);

        const swapEvents = await publicClient.getContractEvents({
            address: pairAddress as `0x${string}`,
            abi: PairABI,
            eventName: 'Swap',
            fromBlock,
            toBlock: currentBlock
        });

        // Calculate volumes
        let volume0 = 0n;
        let volume1 = 0n;
        const recentSwaps = swapEvents.map((event: any) => {
            const { args } = event;
            if (!args) return null;

            const { amount0In, amount0Out, amount1In, amount1Out, sender, to } = args;
            
            // Add to total volume
            volume0 += (BigInt(amount0In) + BigInt(amount0Out));
            volume1 += (BigInt(amount1In) + BigInt(amount1Out));

            return {
                sender,
                to,
                amount0: {
                    in: amount0In.toString(),
                    out: amount0Out.toString()
                },
                amount1: {
                    in: amount1In.toString(),
                    out: amount1Out.toString()
                },
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash
            };
        }).filter(Boolean);

        return res.json({
            pairAddress,
            tokens: {
                token0: {
                    address: token0Address,
                    name: token0Name,
                    symbol: token0Symbol,
                    totalVolume: volume0.toString()
                },
                token1: {
                    address: token1Address,
                    name: token1Name,
                    symbol: token1Symbol,
                    totalVolume: volume1.toString()
                }
            },
            swapHistory: {
                fromBlock: fromBlock.toString(),
                toBlock: currentBlock.toString(),
                swaps: recentSwaps
            }
        });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Unknown error occurred' });
    }
};
