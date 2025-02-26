/**
 * 🚀 Uniswap Interactions Script 🚀
 * 
 * A comprehensive toolkit for DeFi operations with Uniswap V2 protocol.
 * This script enables seamless token deployment, liquidity operations, and trading activities.
 * 
 * ✨ Features:
 * - Deploy custom ERC20 tokens
 * - Add/remove liquidity with ETH or token pairs
 * - Execute token swaps with customizable parameters
 * - Monitor liquidity pools and trading data
 * - Calculate price impacts and optimal paths
 * - View token balances and positions
 * 
 * 📋 Prerequisites: 
 * - .env file with PRIVATE_KEY and RPC_URL variables
 * - Node.js environment with required packages installed
 * 
 * 🔧 Usage: 
 *   npx ts-node uniswapInteractions.ts
 * 
 * 🔒 Security Note:
 * This script handles private keys and financial transactions.
 * Never share your private keys or execute this script on untrusted networks.
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { createPublicClient, createWalletClient, http, parseEther, encodeFunctionData, Account, parseGwei, isAddress, formatEther, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';
import path from 'path';
import { PairABI, RouterABI, TokenABI } from '../Backend/src/config/index'
import fs from 'fs';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// API endpoint for backend services
const BACKEND_URL = 'http://localhost:3000/api';
// Get private key from environment variables for signing transactions
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

/**
 * Define custom blockchain for interactions
 * This custom chain definition allows the script to connect to a specific network
 */
const ABCTestnet = defineChain({
    id: 112,
    name: 'ABC Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'TEST',
        symbol: 'TEST',
    },
    rpcUrls: {
        default: {
            http: [process.env.RPC_URL || 'http://localhost:8545'],
        },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://explorer.abc.t.raas.gelato.cloud' },
    },
})

// Initialize read-only client for blockchain interactions
const publicClient = createPublicClient({
    chain: ABCTestnet,
    transport: http()
});

// Create wallet account from private key
const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
// Initialize client for sending transactions
const walletClient = createWalletClient({
    account,
    chain: ABCTestnet,
    transport: http()
});

// Token deployment parameters
const TOKEN_SUPPLY = parseEther('1000000'); // 1 million tokens with 18 decimals
const TOKEN_NAME = 'MyTestToken2';
const TOKEN_SYMBOL = 'MTT2';

// Contract bytecode for deploying new ERC20 tokens
// This is the compiled solidity code for the token contract
const ERC20_BYTECODE = '0x608060405234801561001057600080fd5b50604051610b6c380380610b6c8339818101604052602081101561003357600080fd5b50516040514690806052610b1a8239604080519182900360520182208282018252600a8352692ab734b9bbb0b8102b1960b11b6020938401528151808301835260018152603160f81b908401528151808401919091527fbfcc8ef98ffbf7b6c3fec7bf5185b566b9863e35a9d83acd49ad6824b5969738818301527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6606082015260808101949094523060a0808601919091528151808603909101815260c0909401905282519201919091206003555061011633826001600160e01b0361011c16565b5061021c565b610135816000546101be60201b6108621790919060201c565b60009081556001600160a01b0383168152600160209081526040909120546101669183906108626101be821b17901c565b6001600160a01b03831660008181526001602090815260408083209490945583518581529351929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35050565b80820182811015610216576040805162461bcd60e51b815260206004820152601460248201527f64732d6d6174682d6164642d6f766572666c6f77000000000000000000000000604482015290519081900360640190fd5b92915050565b6108ef8061022b6000396000f3fe608060405234801561001057600080fd5b50600436106100df5760003560e01c80633644e5151161008c57806395d89b411161006657806395d89b411461026b578063a9059cbb14610273578063d505accf1461029f578063dd62ed3e146102f2576100df565b80633644e5151461021757806370a082311461021f5780637ecebe0014610245576100df565b806323b872dd116100bd57806323b872dd146101bb57806330adf81f146101f1578063313ce567146101f9576100df565b806306fdde03146100e4578063095ea7b31461016157806318160ddd146101a1575b600080fd5b6100ec610320565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561012657818101518382015260200161010e565b50505050905090810190601f1680156101535780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61018d6004803603604081101561017757600080fd5b506001600160a01b038135169060200135610359565b604080519115158252519081900360200190f35b6101a9610370565b60408051918252519081900360200190f35b61018d600480360360608110156101d157600080fd5b506001600160a01b03813581169160208101359091169060400135610376565b6101a9610410565b610201610434565b6040805160ff9092168252519081900360200190f35b6101a9610439565b6101a96004803603602081101561023557600080fd5b50356001600160a01b031661043f565b6101a96004803603602081101561025b57600080fd5b50356001600160a01b0316610451565b6100ec610463565b61018d6004803603604081101561028957600080fd5b506001600160a01b03813516906020013561049c565b6102f0600480360360e08110156102b557600080fd5b506001600160a01b03813581169160208101359091169060408101359060608101359060ff6080820135169060a08101359060c001356104a9565b005b6101a96004803603604081101561030857600080fd5b506001600160a01b03813581169160200135166106d1565b6040518060400160405280600a81526020017f556e69737761702056320000000000000000000000000000000000000000000081525081565b60006103663384846106ee565b5060015b92915050565b60005481565b6001600160a01b0383166000908152600260209081526040808320338452909152812054600019146103fb576001600160a01b03841660009081526002602090815260408083203384529091529020546103d6908363ffffffff61075016565b6001600160a01b03851660009081526002602090815260408083203384529091529020555b6104068484846107a8565b5060019392505050565b7f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c981565b601281565b60035481565b60016020526000908152604090205481565b60046020526000908152604090205481565b6040518060400160405280600681526020017f554e492d5632000000000000000000000000000000000000000000000000000081525081565b60006103663384846107a8565b428410156104fe576040805162461bcd60e51b815260206004820152601260248201527f556e697377617056323a20455850495245440000000000000000000000000000604482015290519081900360640190fd5b6003546001600160a01b0380891660008181526004602090815260408083208054600180820190925582517f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98186015280840196909652958d166060860152608085018c905260a085019590955260c08085018b90528151808603909101815260e0850182528051908301207f19010000000000000000000000000000000000000000000000000000000000006101008601526101028501969096526101228085019690965280518085039096018652610142840180825286519683019690962095839052610162840180825286905260ff89166101828501526101a284018890526101c28401879052519193926101e280820193601f1981019281900390910190855afa158015610634573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b0381161580159061066a5750886001600160a01b0316816001600160a01b0316145b6106bb576040805162461bcd60e51b815260206004820152601c60248201527f556e697377617056323a20494e56414c49445f5349474e415455524500000000604482015290519081900360640190fd5b6106c68989896106ee565b505050505050505050565b600260209081526000928352604080842090915290825290205481565b6001600160a01b03808416600081815260026020908152604080832094871680845294825291829020859055815185815291517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259281900390910190a3505050565b8082038281111561036a576040805162461bcd60e51b815260206004820152601560248201527f64732d6d6174682d7375622d756e646572666c6f770000000000000000000000604482015290519081900360640190fd5b6001600160a01b0383166000908152600160205260409020546107d1908263ffffffff61075016565b6001600160a01b038085166000908152600160205260408082209390935590841681522054610806908263ffffffff61086216565b6001600160a01b0380841660008181526001602090815260409182902094909455805185815290519193928716927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a3505050565b8082018281101561036a576040805162461bcd60e51b815260206004820152601460248201527f64732d6d6174682d6164642d6f766572666c6f77000000000000000000000000604482015290519081900360640190fdfea265627a7a7231582064e64ac02ed5e57f89f232d44678d5fb8a44a9215265f5dd29f89e4e7d87def264736f6c63430005100032454950373132446f6d61696e28737472696e67206e616d652c737472696e672076657273696f6e2c75696e7432353620636861696e49642c6164647265737320766572696679696e67436f6e747261637429';

/**
 * Deploy a new ERC20 token to the blockchain
 * 
 * Creates a new token contract with customizable supply and automatically assigns
 * all tokens to the deployer's address.
 * 
 * @returns {Promise<{
 *   address: string,       // The deployed contract address
 *   transactionHash: string, // Hash of the deployment transaction
 *   blockNumber: number,   // Block number where contract was deployed
 *   gasUsed: bigint        // Amount of gas used for deployment
 * }>}
 * 
 * @tip Consider using a descriptive token name and symbol for better marketplace visibility
 * @tip Deploy tokens with at least 18 decimals to maintain compatibility with most DeFi protocols
 */
async function deployToken() {
    try {
        console.log('Deploying token...');
        // Send deployment transaction
        const hash = await walletClient.deployContract({
            abi: TokenABI,  // Use TokenABI from config instead of ERC20_ABI
            bytecode: ERC20_BYTECODE as `0x${string}`,
            args: [TOKEN_SUPPLY],
            account
        });

        // Wait for deployment to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (!receipt.contractAddress) throw new Error('No contract address in receipt');
        
        console.log('Token deployed at:', receipt.contractAddress);
        console.log('Gas used:', receipt.gasUsed.toString());
        
        return {
            address: receipt.contractAddress,
            transactionHash: receipt.transactionHash,
            blockNumber: Number(receipt.blockNumber),
            gasUsed: receipt.gasUsed
        };
    } catch (error) {
        console.error('Error deploying token:', error);
        throw error;
    }
}

/**
 * Calculate token amount with slippage protection
 * 
 * @param amount The original token amount
 * @param slippagePercent The slippage percentage (e.g., 0.5 for 0.5%)
 * @returns The adjusted amount after applying slippage
 */
function calculateAmountWithSlippage(amount: bigint, slippagePercent: number): bigint {
    // slippagePercent: 0.5 = %0.5, 1 = %1 
    if (slippagePercent <= 0 || slippagePercent >= 100) {
        throw new Error('Invalid slippage percentage');
    }
    const slippageBips = BigInt(Math.floor(slippagePercent * 100)); // %1 = 100 bips
    return amount - ((amount * slippageBips) / 10000n);
}

/**
 * Add liquidity to a token/ETH pair
 * 
 * Contributes both tokens and ETH to a liquidity pool, creating the pair if it doesn't exist.
 * Provides trading liquidity and earns fees for the liquidity provider.
 * 
 * @param {string} tokenAddress - Address of the ERC20 token
 * @param {string} wethAddress - Address of the WETH contract
 * @param {object} options - Optional parameters
 * @param {string} options.tokenAmount - Amount of tokens to add (default: '100')
 * @param {string} options.ethAmount - Amount of ETH to add (default: '0.5')
 * @param {number} options.slippageTolerance - Slippage tolerance percentage (default: 10)
 * 
 * @returns {Promise<{
 *   success: boolean,           // Whether the transaction succeeded
 *   transactionHash: string,    // Transaction hash 
 *   lpTokensReceived: string,   // Estimated LP tokens received (if available)
 *   poolShare: string,          // Estimated share of the pool after adding liquidity
 *   gasCost: {                  // Gas cost information
 *     eth: string,              // Cost in ETH
 *     gwei: string              // Cost in Gwei
 *   }
 * }>}
 * 
 * @tip Add liquidity when price volatility is low for better entry positions
 * @tip For new pools, consider the initial price carefully as it sets the base ratio
 */
async function addLiquidity(
    tokenAddress: string, 
    wethAddress: string, 
    options = { 
        tokenAmount: '100', 
        ethAmount: '0.5', 
        slippageTolerance: 10 
    }
) {
    try {
        const tokenAmount = parseEther(options.tokenAmount);
        const ethAmount = parseEther(options.ethAmount);
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

        // Apply slippage tolerance
        const amountAMin = calculateAmountWithSlippage(tokenAmount, options.slippageTolerance);
        const amountBMin = calculateAmountWithSlippage(ethAmount, options.slippageTolerance);

        console.log(`Adding ${options.tokenAmount} tokens and ${options.ethAmount} ETH to liquidity pool`);
        console.log(`Slippage tolerance: ${options.slippageTolerance}%`);

        // Request transaction data from backend
        const response = await axios.post(`${BACKEND_URL}/liquidity/add`, {
            tokenA: tokenAddress,
            tokenB: wethAddress,
            amountADesired: tokenAmount.toString(),
            amountBDesired: ethAmount.toString(),
            amountAMin: amountAMin.toString(),
            amountBMin: amountBMin.toString(),
            to: account.address,
            deadline: deadline.toString(),
            liquidityType: 'ADD_ETH'
        });

        const { to, data, value } = response.data;
        const txData = data.startsWith('0x') ? data : '0x' + data;

        // Record gas price for reporting
        const gasPrice = await publicClient.getGasPrice();
        
        // Send transaction
        const hash = await walletClient.sendTransaction({
            to: to,
            data: txData,
            value: BigInt(value),
            account: account
        });

        // Wait for transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        const success = receipt.status === 'success';
        
        // Calculate gas cost
        const gasCost = receipt.gasUsed * gasPrice;
        const gasEth = formatEther(gasCost);
        const gasGwei = formatUnits(gasPrice, 9);
        
        console.log('Liquidity addition successful:', success);
        console.log('Transaction hash:', receipt.transactionHash);
        console.log('Gas used:', receipt.gasUsed.toString());
        console.log('Gas cost (ETH):', gasEth);
        
        // Get pair information to estimate LP tokens and pool share
        const pairInfo = await getPairReserve(tokenAddress as `0x${string}`, wethAddress as `0x${string}`);
        
        // Return detailed information
        return {
            success,
            transactionHash: receipt.transactionHash,
            lpTokensReceived: "Calculation requires events parsing",
            poolShare: "Calculation requires additional data",
            gasCost: {
                eth: gasEth,
                gwei: gasGwei
            }
        };
    } catch (error) {
        console.error('Error adding liquidity:', error);
        throw error;
    }
}

/**
 * Remove liquidity from a token/ETH pair
 * 
 * Withdraws liquidity from a Uniswap pair and receives back tokens and ETH.
 * Requires the user to have LP tokens from the pair.
 * 
 * @param tokenAddress Address of the ERC20 token
 * @param pairAddress Address of the liquidity pair contract
 * @returns Transaction receipt from the liquidity removal
 */
async function removeLiquidity(tokenAddress: string, pairAddress: string) {
    try {
        const liquidity = parseEther('5'); // Remove 5 LP tokens
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

        // Request transaction data from backend
        const response = await axios.post(`${BACKEND_URL}/liquidity/remove`, {
            tokenA: tokenAddress,
            tokenB: 'ETH',
            liquidity: liquidity.toString(),
            amountAMin: '0',
            amountBMin: '0',
            to: account.address,
            deadline: deadline.toString(),
            liquidityType: 'REMOVE_ETH'
        });

        const { to, data, value } = response.data;

        // Send transaction
        const hash = await walletClient.sendTransaction({
            to,
            data,
            value,
            account
        });

        // Wait for transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Liquidity removed, transaction hash:', receipt.transactionHash);
        return receipt;
    } catch (error) {
        console.error('Error removing liquidity:', error);
        throw error;
    }
}

/**
 * Swap tokens for ETH
 * 
 * Exchanges a specified amount of tokens for ETH using Uniswap.
 * The exact input amount is specified and the output amount will vary based on market conditions.
 * 
 * @param tokenAddress Address of the token to swap
 * @param amountIn Amount of tokens to swap, as a string (e.g., "10")
 * @returns Transaction receipt from the swap
 */
async function swapTokensForETH(tokenAddress: string, amountIn: string) {
    try {
        const tokenAmount = parseEther(amountIn); // Convert to wei
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        const wethAddress = '0xcde412ba5370eDEb27F3C549f8E9949D296045CF' as `0x${string}`;
        const tokenAmountMin = calculateAmountWithSlippage(tokenAmount, 50);

        // Request transaction data from backend
        const response = await axios.post(`${BACKEND_URL}/swap/swap`, {
            tokenIn: tokenAddress,
            tokenOut: wethAddress,
            amountIn: tokenAmount.toString(),
            amountOutMin: "0", // No minimum - consider setting a reasonable value in production
            to: account.address,
            deadline: deadline.toString(),
            path: [tokenAddress, wethAddress]
        });

        console.log('tokenAmount:', tokenAmount.toString());
        console.log('tokenAmountMin:', tokenAmountMin.toString());

        const { to, data, value } = response.data;

        // Send transaction
        const hash = await walletClient.sendTransaction({
            to,
            data,
            account
        });

        // Wait for transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Tokens swapped for ETH, transaction hash:', receipt.transactionHash);
        return receipt;
    } catch (error) {
        console.error('Error swapping tokens for ETH:', error);
        throw error;
    }
}

/**
 * Swap ETH for tokens
 * 
 * Exchanges a specified amount of ETH for tokens using Uniswap.
 * The exact ETH input amount is specified and the token output will vary based on market conditions.
 * 
 * @param tokenAddress Address of the token to receive
 * @param amountIn Amount of ETH to swap, as a string (e.g., "0.1")
 * @returns Transaction receipt from the swap
 */
async function swapETHForTokens(tokenAddress: string, amountIn: string) {
    try {
        const ethAmount = parseEther(amountIn); // Convert to wei
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        const wethAddress = '0xcde412ba5370eDEb27F3C549f8E9949D296045CF' as `0x${string}`;

        // Request transaction data from backend
        const response = await axios.post(`${BACKEND_URL}/swap/swap`, {
            tokenIn: wethAddress,
            tokenOut: tokenAddress,
            amountIn: ethAmount.toString(),
            amountOutMin: "0", // No minimum - consider setting a reasonable value in production
            to: account.address,
            deadline: deadline.toString(),
            path: [wethAddress, tokenAddress]
        });

        const { to, data, value } = response.data;

        console.log('ethAmount:', ethAmount.toString());
        console.log('value:', value);

        // Send transaction
        const hash = await walletClient.sendTransaction({
            to,
            data,
            value: BigInt(value),
            account
        });

        // Wait for transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('ETH swapped for tokens, transaction hash:', receipt.transactionHash);
        return receipt;
    } catch (error) {
        console.error('Error swapping ETH for tokens:', error);
        throw error;
    }
}

/**
 * Get reserves for a specific token pair
 * 
 * Retrieves the current liquidity reserves for a token pair from Uniswap.
 * 
 * @param tokenA First token address
 * @param tokenB Second token address
 * @returns Object containing reserve information
 */
async function getPairReserve(tokenA: `0x${string}`, tokenB: `0x${string}`) {
    const response = await axios.post(`${BACKEND_URL}/pool/reserves-for-tokens`, {
        tokenA: tokenA,
        tokenB: tokenB
    });
    console.log('reserves:', JSON.stringify(response.data, null, 2));
    return response.data;
}

/**
 * Get information about all liquidity pools
 * 
 * Fetches comprehensive information about all pools in the Uniswap ecosystem,
 * including token reserves, symbols, and calculated metrics like price and liquidity.
 * 
 * @returns {Promise<{
 *   pools: Array<{
 *     pairAddress: string,    // Address of the liquidity pair contract
 *     poolData: {
 *       token0: {             // First token in the pair
 *         address: string,    // Token contract address
 *         name: string,       // Token name
 *         symbol: string,     // Token symbol
 *         reserve: string     // Current reserve in the pool
 *       },
 *       token1: {             // Second token in the pair
 *         address: string,    // Token contract address
 *         name: string,       // Token name
 *         symbol: string,     // Token symbol
 *         reserve: string     // Current reserve in the pool
 *       },
 *       metrics: {
 *         tokenPrice: string, // Price of token0 expressed in token1
 *         liquidity: string   // Geometric mean of reserves as liquidity indicator
 *       }
 *     }
 *   }>
 * }>}
 * 
 * @tip Use this function to discover active trading pairs and analyze market dynamics
 * @tip Higher liquidity pools generally offer better trading prices with less slippage
 */
async function getAllPoolsInfo() {
    const response = await axios.get(`${BACKEND_URL}/pool/all`);
    console.log('Pool information:', JSON.stringify(response.data, null, 2));
    return response.data;
}

/**
 * Get trading volume data for a specific liquidity pool
 * 
 * Retrieves detailed volume data and recent swap events for a specific pool,
 * helping users analyze trading activity and market trends.
 * 
 * @param {`0x${string}`} pairAddress - Address of the liquidity pair contract
 * @returns {Promise<{
 *   pairAddress: string,      // Address of the liquidity pair
 *   tokens: {                 // Information about both tokens in the pair
 *     token0: {
 *       address: string,      // Token contract address
 *       name: string,         // Token name
 *       symbol: string,       // Token symbol
 *       totalVolume: string   // Total trading volume for this token
 *     },
 *     token1: {
 *       address: string,      // Token contract address
 *       name: string,         // Token name
 *       symbol: string,       // Token symbol
 *       totalVolume: string   // Total trading volume for this token
 *     }
 *   },
 *   swapHistory: {            // Recent swap event history
 *     fromBlock: string,      // Starting block number of the data range
 *     toBlock: string,        // Ending block number of the data range
 *     swaps: Array<{          // List of individual swap events
 *       sender: string,       // Address that initiated the swap
 *       to: string,           // Address that received the output tokens
 *       amount0: {
 *         in: string,         // Amount of token0 swapped in
 *         out: string         // Amount of token0 swapped out
 *       },
 *       amount1: {
 *         in: string,         // Amount of token1 swapped in
 *         out: string         // Amount of token1 swapped out
 *       },
 *       blockNumber: number,  // Block number where the swap occurred
 *       transactionHash: string // Transaction hash of the swap
 *     }>
 *   }
 * }>}
 * 
 * @tip Trading volume often correlates with market interest and price movements
 * @tip Monitor swap events to identify trading patterns and whale activity
 */
async function getPoolVolume(pairAddress: `0x${string}`) {
    const response = await axios.get(`${BACKEND_URL}/pool/volume/${pairAddress}`);
    console.log('Volume data:', JSON.stringify(response.data, null, 2));
    return response.data;
}

/**
 * Approve a spender to use tokens
 * 
 * Grants permission for a contract (usually the router) to transfer tokens on behalf of the user.
 * This must be called before adding liquidity or performing token swaps.
 * 
 * @param tokenAddress Address of the token contract
 * @param spender Address of the contract being approved (usually router)
 * @param amount Amount of tokens to approve
 * @returns Transaction receipt from the approval
 */
async function approveToken(tokenAddress: `0x${string}`, spender: `0x${string}`, amount: bigint) {
    try {
        const hash = await walletClient.writeContract({
            address: tokenAddress,
            abi: TokenABI,  // Use TokenABI from config instead of ERC20_ABI
            functionName: 'approve',
            args: [spender, amount]
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Token approved, transaction hash:', receipt.transactionHash);
        return receipt;
    } catch (error) {
        console.error('Error approving token:', error);
        throw error;
    }
}

/**
 * Get token balance for a specific address
 * 
 * Queries the token contract to get the balance of a given address.
 * Useful for checking available tokens before performing operations.
 * 
 * @param {`0x${string}`} tokenAddress - The token contract address
 * @param {`0x${string}`} ownerAddress - The address to check balance for (defaults to account address)
 * @returns {Promise<{
 *   tokenAddress: string,     // Address of the token contract
 *   ownerAddress: string,     // Address of the token owner
 *   rawBalance: string,       // Raw balance in smallest units
 *   formattedBalance: string, // Human readable balance with decimals
 *   tokenDetails: {           // Additional token information
 *     name: string,           // Token name
 *     symbol: string,         // Token symbol
 *     decimals: number        // Token decimals
 *   }
 * }>}
 * 
 * @tip Always check token balances before approving or executing swaps
 * @tip Be aware of tokens with non-standard decimals when interpreting balances
 */
async function getTokenBalance(
    tokenAddress: `0x${string}`, 
    ownerAddress?: `0x${string}`
) {
    try {
        const address = ownerAddress || account.address;
        
        // Call backend API to get token balance
        const response = await axios.get(
            `${BACKEND_URL}/token/balance/${tokenAddress}`, 
            { params: { address } }
        );
        
        const balanceData = response.data;
        
        console.log(`Token: ${balanceData.tokenDetails.name} (${balanceData.tokenDetails.symbol})`);
        console.log(`Balance for ${balanceData.ownerAddress}: ${balanceData.formattedBalance}`);
        
        return balanceData;
    } catch (error) {
        console.error('Error getting token balance:', error);
        throw error;
    }
}

/**
 * Calculate price impact for a swap
 * 
 * Estimates how much a trade will move the market price, helping users
 * avoid excessive slippage on large trades.
 * 
 * @param {`0x${string}`} tokenInAddress - Address of input token
 * @param {`0x${string}`} tokenOutAddress - Address of output token
 * @param {string} amountIn - Amount of input tokens as a string
 * @returns {Promise<{
 *   priceImpact: string,      // Price impact as percentage string
 *   isHighImpact: boolean,    // Flag for high impact trades (>3%)
 *   amountIn: string,         // Amount of input tokens
 *   expectedOut: string,      // Expected amount of output tokens (raw)
 *   formattedExpectedOut: string, // Formatted expected output amount
 *   route: string,            // Swap route description
 *   warning: string | null    // Warning message for high impact trades
 * }>}
 * 
 * @tip Trades with >3% price impact are generally considered high impact
 * @tip Consider splitting large trades into smaller ones to reduce price impact
 */
async function calculatePriceImpact(
    tokenInAddress: `0x${string}`, 
    tokenOutAddress: `0x${string}`, 
    amountIn: string
) {
    try {
        // Call backend API to calculate price impact
        const response = await axios.post(`${BACKEND_URL}/token/price-impact`, {
            tokenInAddress,
            tokenOutAddress,
            amountIn
        });
        
        const impactData = response.data;
        
        console.log(`Swap: ${amountIn} for ~${impactData.formattedExpectedOut}`);
        console.log(`Price impact: ${impactData.priceImpact}`);
        
        return impactData;
    } catch (error) {
        console.error('Error calculating price impact:', error);
        throw error;
    }
}

/**
 * Get position details for liquidity provider
 * 
 * Retrieves information about a user's liquidity position in a specific pool.
 * Helps LPs track their position value, fees earned, and impermanent loss.
 * 
 * @param {`0x${string}`} pairAddress - Address of the liquidity pair
 * @param {`0x${string}`} userAddress - User address to check (defaults to account address)
 * @returns {Promise<{
 *   pairAddress: string,      // Address of the liquidity pair
 *   userAddress: string,      // Address of the LP
 *   lpTokens: {               // LP token information
 *     balance: string,        // Raw balance of LP tokens
 *     formattedBalance: string, // Formatted balance of LP tokens
 *     totalSupply: string,    // Raw total supply of LP tokens
 *     formattedTotalSupply: string, // Formatted total supply
 *     share: string           // User's share of the pool as percentage
 *   },
 *   tokens: {                 // Information about pool tokens
 *     token0: {
 *       address: string,      // Token address
 *       name: string,         // Token name
 *       symbol: string,       // Token symbol
 *       reserve: string,      // Raw token reserve
 *       formattedReserve: string, // Formatted token reserve
 *       userLiquidity: string // User's share of liquidity in this token
 *     },
 *     token1: {
 *       address: string,      // Token address
 *       name: string,         // Token name
 *       symbol: string,       // Token symbol
 *       reserve: string,      // Raw token reserve
 *       formattedReserve: string, // Formatted token reserve
 *       userLiquidity: string // User's share of liquidity in this token
 *     }
 *   },
 *   valueUSD: string          // Estimated value in USD (if available)
 * }>}
 * 
 * @tip Monitor your position's value over time to detect impermanent loss
 * @tip Consider removing liquidity when price volatility increases
 */
async function getLiquidityPosition(
    pairAddress: `0x${string}`, 
    userAddress?: `0x${string}`
) {
    try {
        const address = userAddress || account.address;
        
        // Call backend API to get liquidity position
        const response = await axios.get(
            `${BACKEND_URL}/token/liquidity-position/${pairAddress}`, 
            { params: { address } }
        );
        
        const positionData = response.data;
        
        console.log(`LP Position for ${positionData.userAddress}:`);
        console.log(`LP tokens: ${positionData.lpTokens.formattedBalance} of ${positionData.lpTokens.formattedTotalSupply} (${positionData.lpTokens.share})`);
        console.log(`Token liquidity: ${positionData.tokens.token0.userLiquidity} ${positionData.tokens.token0.symbol}, ${positionData.tokens.token1.userLiquidity} ${positionData.tokens.token1.symbol}`);
        
        return positionData;
    } catch (error) {
        console.error('Error getting liquidity position:', error);
        throw error;
    }
}


/**
 * Main execution function
 * 
 * This is the entry point of the script that executes the desired operations.
 * Uncomment specific function calls to perform different actions.
 */
async function main() {
    try {
        // Contract addresses
        const wethAddress = '0xcde412ba5370eDEb27F3C549f8E9949D296045CF' as `0x${string}`;
        const routerAddress = '0x6A52e0C6b623190D565f0060c8711AA7127ABB3C' as `0x${string}`;

        // Example token addresses (replace with your own tokens)
        const testToken = '0x11a6615b52b5d95d5c01a65fab6070c3cc23dd22' as `0x${string}`;
        const testToken2 = '0xb793fc98d3e47ce2146747ad7af130fae5ec9cc0' as `0x${string}`;

        // Examples of how to use the various functions:
        
        // 1. Deploy a new token
        // const tokenInfo = await deployToken();
        // console.log(`Token deployed at: ${tokenInfo.address}`);
        
        // 2. Check token balance
        // const balanceInfo = await getTokenBalance(testToken);
        // console.log(`Balance: ${balanceInfo.formattedBalance} ${balanceInfo.tokenDetails.symbol}`);
        
        // 3. Calculate price impact before swapping
        // const impactInfo = await calculatePriceImpact(testToken, wethAddress, "10");
        // if (impactInfo.isHighImpact) {
        //    console.log(`WARNING: ${impactInfo.warning}`);
        // }
        
        // 4. Add liquidity with custom parameters
        // await addLiquidity(testToken, wethAddress, { 
        //    tokenAmount: "50", 
        //    ethAmount: "0.25", 
        //    slippageTolerance: 5 
        // });
        
        // 5. Get liquidity position details
        // const positionInfo = await getLiquidityPosition("0xe278b113F38CA91d81164264aFd7830e5613B395");
        // console.log(`Your pool share: ${positionInfo.lpTokens.share}`);
        
        // 6. Export swap history for analysis
        // await exportSwapDataToCSV("0xe278b113F38CA91d81164264aFd7830e5613B395", "./my_swap_history.csv");
        
        // 7. Get pool volume information
        await getPoolVolume("0xe278b113F38CA91d81164264aFd7830e5613B395");

        console.log('🎉 All operations completed successfully! 🎉');
    } catch (error) {
        console.error('❌ Error in main execution:', error);
    }
}

// Execute the script
main();