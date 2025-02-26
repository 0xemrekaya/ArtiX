import { Request, Response } from 'express';
import { publicClient } from '../utils/client';
import { isAddress, formatEther, formatUnits } from 'viem';
import { config, PairABI, TokenABI, FactoryABI } from '../config';

/**
 * Get token balance for a specific address
 * 
 * @param req Request object containing tokenAddress and optional ownerAddress
 * @param res Response object to return the balance information
 */
export const getTokenBalance = async (req: Request, res: Response) => {
    try {
        const { tokenAddress } = req.params;
        // Fix: Better handling of address from either params or query
        const ownerAddress = req.params.ownerAddress || req.query.address as string;
        
        // Fix: Proper validation of addresses
        if (!isAddress(tokenAddress)) {
            return res.status(400).json({ error: 'Invalid token address provided' });
        }
        
        if (!ownerAddress || !isAddress(ownerAddress)) {
            return res.status(400).json({ error: 'Invalid owner address provided' });
        }

        const formattedTokenAddress = tokenAddress as `0x${string}`;
        const formattedOwnerAddress = ownerAddress as `0x${string}`;
        
        try {
            // Get token balance
            const balance = await publicClient.readContract({
                address: formattedTokenAddress,
                abi: TokenABI,
                functionName: 'balanceOf',
                args: [formattedOwnerAddress]
            }) as bigint;
            
            // Get token details
            const [name, symbol, decimals] = await Promise.all([
                publicClient.readContract({
                    address: formattedTokenAddress,
                    abi: TokenABI,
                    functionName: 'name',
                    args: []
                }),
                publicClient.readContract({
                    address: formattedTokenAddress,
                    abi: TokenABI,
                    functionName: 'symbol',
                    args: []
                }),
                publicClient.readContract({
                    address: formattedTokenAddress,
                    abi: TokenABI,
                    functionName: 'decimals',
                    args: []
                })
            ]) as [string, string, number];
            
            // Format balance according to decimals
            const formattedBalance = formatUnits(balance, decimals);
            
            res.json({
                tokenAddress: formattedTokenAddress,
                ownerAddress: formattedOwnerAddress,
                rawBalance: balance.toString(),
                formattedBalance,
                tokenDetails: {
                    name,
                    symbol,
                    decimals
                }
            });
        } catch (contractError) {
            // Fix: Better error handling for contract issues
            return res.status(400).json({ 
                error: 'Error reading token data. Make sure the address is a valid token contract.'
            });
        }
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
};

/**
 * Calculate price impact for a token swap
 * 
 * Estimates how much a trade will move the market price
 * 
 * @param req Request object containing tokenInAddress, tokenOutAddress, and amountIn
 * @param res Response object to return the price impact information
 */
export const calculatePriceImpact = async (req: Request, res: Response) => {
    try {
        const { tokenInAddress, tokenOutAddress, amountIn } = req.body;
        
        // Fix: Better input validation
        if (!isAddress(tokenInAddress) || !isAddress(tokenOutAddress)) {
            return res.status(400).json({ error: 'Invalid token address provided' });
        }
        
        if (!amountIn || isNaN(Number(amountIn)) || Number(amountIn) <= 0) {
            return res.status(400).json({ error: 'Invalid amount provided' });
        }
        
        const formattedTokenInAddress = tokenInAddress as `0x${string}`;
        const formattedTokenOutAddress = tokenOutAddress as `0x${string}`;

        try {
            // Get pair address from the factory
            const pairAddress = await publicClient.readContract({
                address: config.factoryAddress,
                abi: FactoryABI,
                functionName: 'getPair',
                args: [formattedTokenInAddress, formattedTokenOutAddress]
            }) as `0x${string}`;
            
            // Fix: Better zero address comparison
            if (pairAddress === '0x0000000000000000000000000000000000000000') {
                return res.json({
                    priceImpact: "Cannot calculate - pool doesn't exist",
                    isHighImpact: true,
                    amountIn,
                    expectedOut: "0",
                    formattedExpectedOut: "0",
                    route: `${tokenInAddress} → ${tokenOutAddress}`,
                    warning: "No liquidity pool exists for this pair"
                });
            }
            
            // Get token symbols
            const [token0Symbol, token1Symbol] = await Promise.all([
                publicClient.readContract({
                    address: formattedTokenInAddress,
                    abi: TokenABI,
                    functionName: 'symbol',
                    args: []
                }),
                publicClient.readContract({
                    address: formattedTokenOutAddress,
                    abi: TokenABI,
                    functionName: 'symbol',
                    args: []
                })
            ]) as [string, string];
            
            // Get token0 address to determine ordering
            const token0Address = await publicClient.readContract({
                address: pairAddress,
                abi: PairABI,
                functionName: 'token0',
                args: []
            }) as `0x${string}`;
            
            // Get reserves
            const reserves = await publicClient.readContract({
                address: pairAddress,
                abi: PairABI,
                functionName: 'getReserves',
                args: []
            }) as [bigint, bigint, number];
            
            // Determine which token is token0 and which is token1
            const isTokenInToken0 = formattedTokenInAddress.toLowerCase() === token0Address.toLowerCase();
            
            const reserveIn = isTokenInToken0 ? reserves[0] : reserves[1];
            const reserveOut = isTokenInToken0 ? reserves[1] : reserves[0];
            
            // Fix: Safely convert amountIn to bigint with proper error handling
            let amountInValue: bigint;
            try {
                amountInValue = BigInt(amountIn);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid amount format. Cannot convert to BigInt.' });
            }
            
            // Check for zero reserves
            if (reserveIn === 0n || reserveOut === 0n) {
                return res.json({
                    priceImpact: "Cannot calculate - insufficient liquidity",
                    isHighImpact: true,
                    amountIn,
                    expectedOut: "0",
                    formattedExpectedOut: "0",
                    route: `${token0Symbol} → ${token1Symbol}`,
                    warning: "Pool has insufficient liquidity for this swap"
                });
            }
            
            // Calculate expected output using x * y = k formula
            const amountInWithFee = amountInValue * 997n; // 0.3% fee
            const numerator = amountInWithFee * reserveOut;
            const denominator = reserveIn * 1000n + amountInWithFee;
            const amountOut = numerator / denominator;
            
            // Fix: Safe calculations for price impact
            // Calculate price before swap: reserveOut / reserveIn
            const priceBefore = Number(reserveOut) / Number(reserveIn);
            
            // Calculate price after swap: (reserveOut - amountOut) / (reserveIn + amountInValue)
            const priceAfter = Number(reserveOut - amountOut) / Number(reserveIn + amountInValue);
            
            // Fix: Handle potential NaN or Infinity
            let priceImpact = 0;
            if (isFinite(priceBefore) && isFinite(priceAfter) && priceBefore !== 0) {
                priceImpact = Math.abs((priceAfter - priceBefore) / priceBefore * 100);
            }
            
            const formattedImpact = priceImpact.toFixed(2);
            const isHighImpact = priceImpact > 3;
            
            // Fix: Use actual token symbols in route
            const route = `${token0Symbol} → ${token1Symbol}`;

            res.json({
                priceImpact: `${formattedImpact}%`,
                priceImpactRaw: priceImpact,
                isHighImpact,
                amountIn: amountIn.toString(),
                expectedOut: amountOut.toString(),
                formattedExpectedOut: formatEther(amountOut),
                route,
                warning: isHighImpact ? 
                    `High price impact! Your trade will move the market price by ${formattedImpact}%` : null
            });
        } catch (contractError) {
            // Fix: Better error handling for contract issues
            return res.status(400).json({ 
                error: 'Error calculating price impact. Make sure the addresses are valid token contracts.'
            });
        }
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
};

/**
 * Get position details for a liquidity provider
 * 
 * @param req Request object containing pairAddress and optional userAddress
 * @param res Response object to return the liquidity position information
 */
export const getLiquidityPosition = async (req: Request, res: Response) => {
    try {
        const { pairAddress } = req.params;
        // Fix: Better handling of address from either params or query
        const userAddress = req.params.userAddress || req.query.address as string;
        
        if (!isAddress(pairAddress)) {
            return res.status(400).json({ error: 'Invalid pair address provided' });
        }
        
        if (!userAddress || !isAddress(userAddress)) {
            return res.status(400).json({ error: 'Invalid user address provided' });
        }
        
        const formattedPairAddress = pairAddress as `0x${string}`;
        const formattedUserAddress = userAddress as `0x${string}`;

        try {
            // Get user LP token balance
            const lpBalance = await publicClient.readContract({
                address: formattedPairAddress,
                abi: PairABI,
                functionName: 'balanceOf',
                args: [formattedUserAddress]
            }) as bigint;
            
            // Get total supply of LP tokens
            const lpTotalSupply = await publicClient.readContract({
                address: formattedPairAddress,
                abi: PairABI,
                functionName: 'totalSupply',
                args: []
            }) as bigint;
            
            // Get token addresses
            const token0Address = await publicClient.readContract({
                address: formattedPairAddress,
                abi: PairABI,
                functionName: 'token0',
                args: []
            }) as `0x${string}`;
            
            const token1Address = await publicClient.readContract({
                address: formattedPairAddress,
                abi: PairABI,
                functionName: 'token1',
                args: []
            }) as `0x${string}`;
            
            // Get token symbols and names
            const [token0Symbol, token0Name, token1Symbol, token1Name] = await Promise.all([
                publicClient.readContract({
                    address: token0Address,
                    abi: TokenABI,
                    functionName: 'symbol',
                    args: []
                }),
                publicClient.readContract({
                    address: token0Address,
                    abi: TokenABI,
                    functionName: 'name',
                    args: []
                }),
                publicClient.readContract({
                    address: token1Address,
                    abi: TokenABI,
                    functionName: 'symbol',
                    args: []
                }),
                publicClient.readContract({
                    address: token1Address,
                    abi: TokenABI,
                    functionName: 'name',
                    args: []
                })
            ]) as [string, string, string, string];
            
            // Get reserves
            const reserves = await publicClient.readContract({
                address: formattedPairAddress,
                abi: PairABI,
                functionName: 'getReserves',
                args: []
            }) as [bigint, bigint, number];
            
            const reserve0 = reserves[0];
            const reserve1 = reserves[1];
            
            // Calculate user's share of the pool
            // Fix: Safe calculation for user share
            let userShare = 0;
            let userSharePercent = "0.0000";
            
            if (lpTotalSupply > 0n) {
                userShare = Number(lpBalance) / Number(lpTotalSupply);
                userSharePercent = (userShare * 100).toFixed(4);
            }
            
            // Fix: Safe calculation for user's token amounts
            let userToken0 = "0";
            let userToken1 = "0";
            
            if (userShare > 0) {
                // Calculate using BigInt for accuracy, safer multiplication
                const shareScaled = BigInt(Math.floor(userShare * 1e18));
                const userToken0BigInt = (reserve0 * shareScaled) / BigInt(1e18);
                const userToken1BigInt = (reserve1 * shareScaled) / BigInt(1e18);
                
                userToken0 = formatEther(userToken0BigInt);
                userToken1 = formatEther(userToken1BigInt);
            }
            
            res.json({
                pairAddress: formattedPairAddress,
                userAddress: formattedUserAddress,
                lpTokens: {
                    balance: lpBalance.toString(),
                    formattedBalance: formatEther(lpBalance),
                    totalSupply: lpTotalSupply.toString(),
                    formattedTotalSupply: formatEther(lpTotalSupply),
                    share: `${userSharePercent}%`
                },
                tokens: {
                    token0: {
                        address: token0Address,
                        name: token0Name,
                        symbol: token0Symbol,
                        reserve: reserve0.toString(),
                        formattedReserve: formatEther(reserve0),
                        userLiquidity: userToken0
                    },
                    token1: {
                        address: token1Address,
                        name: token1Name,
                        symbol: token1Symbol, 
                        reserve: reserve1.toString(),
                        formattedReserve: formatEther(reserve1),
                        userLiquidity: userToken1
                    }
                },
                valueUSD: "USD pricing unavailable without oracle"
            });
        } catch (contractError) {
            // Fix: Better error handling for contract issues
            return res.status(400).json({ 
                error: 'Error reading pair data. Make sure the address is a valid pair contract.'
            });
        }
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
};
