import axios from 'axios';
import dotenv from 'dotenv';
import { createPublicClient, createWalletClient, http, parseEther, encodeFunctionData, Account, parseGwei } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';
import path from 'path';
import { RouterABI } from '../Backend/src/config/index'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const BACKEND_URL = 'http://localhost:3000/api';
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

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

// Initialize viem clients
const publicClient = createPublicClient({
    chain: ABCTestnet,
    transport: http()
});

const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
    account,
    chain: ABCTestnet,
    transport: http()
});

// Token parameters
const TOKEN_SUPPLY = parseEther('1000000'); // 1 million tokens
const TOKEN_NAME = 'MyTestToken';
const TOKEN_SYMBOL = 'MTT';

// ERC20 contract ABI
const ERC20_ABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_totalSupply",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "DOMAIN_SEPARATOR",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "PERMIT_TYPEHASH",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "nonces",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "permit",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// Contract bytecode from the compiled artifact
const ERC20_BYTECODE = '0x608060405234801561001057600080fd5b50604051610b6c380380610b6c8339818101604052602081101561003357600080fd5b50516040514690806052610b1a8239604080519182900360520182208282018252600a8352692ab734b9bbb0b8102b1960b11b6020938401528151808301835260018152603160f81b908401528151808401919091527fbfcc8ef98ffbf7b6c3fec7bf5185b566b9863e35a9d83acd49ad6824b5969738818301527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6606082015260808101949094523060a0808601919091528151808603909101815260c0909401905282519201919091206003555061011633826001600160e01b0361011c16565b5061021c565b610135816000546101be60201b6108621790919060201c565b60009081556001600160a01b0383168152600160209081526040909120546101669183906108626101be821b17901c565b6001600160a01b03831660008181526001602090815260408083209490945583518581529351929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35050565b80820182811015610216576040805162461bcd60e51b815260206004820152601460248201527f64732d6d6174682d6164642d6f766572666c6f77000000000000000000000000604482015290519081900360640190fd5b92915050565b6108ef8061022b6000396000f3fe608060405234801561001057600080fd5b50600436106100df5760003560e01c80633644e5151161008c57806395d89b411161006657806395d89b411461026b578063a9059cbb14610273578063d505accf1461029f578063dd62ed3e146102f2576100df565b80633644e5151461021757806370a082311461021f5780637ecebe0014610245576100df565b806323b872dd116100bd57806323b872dd146101bb57806330adf81f146101f1578063313ce567146101f9576100df565b806306fdde03146100e4578063095ea7b31461016157806318160ddd146101a1575b600080fd5b6100ec610320565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561012657818101518382015260200161010e565b50505050905090810190601f1680156101535780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61018d6004803603604081101561017757600080fd5b506001600160a01b038135169060200135610359565b604080519115158252519081900360200190f35b6101a9610370565b60408051918252519081900360200190f35b61018d600480360360608110156101d157600080fd5b506001600160a01b03813581169160208101359091169060400135610376565b6101a9610410565b610201610434565b6040805160ff9092168252519081900360200190f35b6101a9610439565b6101a96004803603602081101561023557600080fd5b50356001600160a01b031661043f565b6101a96004803603602081101561025b57600080fd5b50356001600160a01b0316610451565b6100ec610463565b61018d6004803603604081101561028957600080fd5b506001600160a01b03813516906020013561049c565b6102f0600480360360e08110156102b557600080fd5b506001600160a01b03813581169160208101359091169060408101359060608101359060ff6080820135169060a08101359060c001356104a9565b005b6101a96004803603604081101561030857600080fd5b506001600160a01b03813581169160200135166106d1565b6040518060400160405280600a81526020017f556e69737761702056320000000000000000000000000000000000000000000081525081565b60006103663384846106ee565b5060015b92915050565b60005481565b6001600160a01b0383166000908152600260209081526040808320338452909152812054600019146103fb576001600160a01b03841660009081526002602090815260408083203384529091529020546103d6908363ffffffff61075016565b6001600160a01b03851660009081526002602090815260408083203384529091529020555b6104068484846107a8565b5060019392505050565b7f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c981565b601281565b60035481565b60016020526000908152604090205481565b60046020526000908152604090205481565b6040518060400160405280600681526020017f554e492d5632000000000000000000000000000000000000000000000000000081525081565b60006103663384846107a8565b428410156104fe576040805162461bcd60e51b815260206004820152601260248201527f556e697377617056323a20455850495245440000000000000000000000000000604482015290519081900360640190fd5b6003546001600160a01b0380891660008181526004602090815260408083208054600180820190925582517f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98186015280840196909652958d166060860152608085018c905260a085019590955260c08085018b90528151808603909101815260e0850182528051908301207f19010000000000000000000000000000000000000000000000000000000000006101008601526101028501969096526101228085019690965280518085039096018652610142840180825286519683019690962095839052610162840180825286905260ff89166101828501526101a284018890526101c28401879052519193926101e280820193601f1981019281900390910190855afa158015610634573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b0381161580159061066a5750886001600160a01b0316816001600160a01b0316145b6106bb576040805162461bcd60e51b815260206004820152601c60248201527f556e697377617056323a20494e56414c49445f5349474e415455524500000000604482015290519081900360640190fd5b6106c68989896106ee565b505050505050505050565b600260209081526000928352604080842090915290825290205481565b6001600160a01b03808416600081815260026020908152604080832094871680845294825291829020859055815185815291517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259281900390910190a3505050565b8082038281111561036a576040805162461bcd60e51b815260206004820152601560248201527f64732d6d6174682d7375622d756e646572666c6f770000000000000000000000604482015290519081900360640190fd5b6001600160a01b0383166000908152600160205260409020546107d1908263ffffffff61075016565b6001600160a01b038085166000908152600160205260408082209390935590841681522054610806908263ffffffff61086216565b6001600160a01b0380841660008181526001602090815260409182902094909455805185815290519193928716927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a3505050565b8082018281101561036a576040805162461bcd60e51b815260206004820152601460248201527f64732d6d6174682d6164642d6f766572666c6f77000000000000000000000000604482015290519081900360640190fdfea265627a7a7231582064e64ac02ed5e57f89f232d44678d5fb8a44a9215265f5dd29f89e4e7d87def264736f6c63430005100032454950373132446f6d61696e28737472696e67206e616d652c737472696e672076657273696f6e2c75696e7432353620636861696e49642c6164647265737320766572696679696e67436f6e747261637429';

async function deployToken() {
    try {
        console.log('Deploying token...');
        const hash = await walletClient.deployContract({
            abi: ERC20_ABI,
            bytecode: ERC20_BYTECODE as `0x${string}`,
            args: [TOKEN_SUPPLY],
            account
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (!receipt.contractAddress) throw new Error('No contract address in receipt');
        console.log('Token deployed at:', receipt.contractAddress);
        return receipt.contractAddress as string;
    } catch (error) {
        console.error('Error deploying token:', error);
        throw error;
    }
}

function calculateAmountWithSlippage(amount: bigint, slippagePercent: number): bigint {
    // slippagePercent: 0.5 = %0.5, 1 = %1 
    if (slippagePercent <= 0 || slippagePercent >= 100) {
        throw new Error('Invalid slippage percentage');
    }
    const slippageBips = BigInt(Math.floor(slippagePercent * 100)); // %1 = 100 bips
    return amount - ((amount * slippageBips) / 10000n);
}

async function addLiquidity(tokenAddress: string, wethAddress: string) {
    try {
        const tokenAmount = parseEther('100'); // 1000 tokens
        const ethAmount = parseEther('0.5'); // 0.5 ETH
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now

        // %10 slippage
        const amountAMin = calculateAmountWithSlippage(tokenAmount, 10);
        const amountBMin = calculateAmountWithSlippage(ethAmount, 10);

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
        console.log('To:', to);
        console.log('value:', value);
        console.log('Txdata:', data);

        const routerAddress = '0xAFAB7513EB80460ABA36d60824d30C61c2E11361' as `0x${string}`;

        try {
            console.log('Simulating transaction with parameters:');
            console.log('Token Address:', tokenAddress);
            console.log('Token Amount:', tokenAmount.toString());
            console.log('Min Token Amount:', amountAMin.toString());
            console.log('Min ETH Amount:', amountBMin.toString());
            console.log('Deadline:', deadline.toString());
            console.log('Value:', value);

            const simulateResult = await publicClient.simulateContract({
                address: to as `0x${string}`,
                abi: RouterABI,
                functionName: 'addLiquidityETH',
                args: [
                    tokenAddress,
                    tokenAmount,
                    amountAMin,
                    amountBMin,
                    account.address,
                    deadline
                ],
                value: BigInt(value),
                account: account.address
            });

            console.log('Simulation successful:', simulateResult);
        } catch (error: any) {
            console.error('\nSimulation Error Details:');
            console.error('Error Message:', error.message);

            if (error && typeof error === 'object') {
                if ('cause' in error) {
                    console.error('Error Cause:', error.cause);
                }
                if ('metaMessages' in error && Array.isArray(error.metaMessages)) {
                    console.error('Meta Messages:', error.metaMessages);
                }
                // Contract error details
                if ('data' in error) {
                    console.error('Error Data:', error.data);
                }
            }

            throw error;
        }

        const hash = await walletClient.sendTransaction({
            to: to,
            data: data,
            value: BigInt(value),
            account: account,
            maxFeePerGas: parseGwei('10'), // 10 gwei
            maxPriorityFeePerGas: parseGwei('5'), // 5 gwei
            gas: 500000n // sabit gas limiti
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        const bool = receipt.status === 'success';
        console.log('Tx is success:', bool);
        console.log('Liquidity added, transaction hash:', receipt.transactionHash);
        return receipt;
    } catch (error) {
        console.error('Error adding liquidity:', error);
        throw error;
    }
}

async function removeLiquidity(tokenAddress: string, pairAddress: string) {
    try {
        const liquidity = parseEther('5'); // Remove 5 LP tokens
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now

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

        const hash = await walletClient.sendTransaction({
            to,
            data,
            value,
            account
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Liquidity removed, transaction hash:', receipt.transactionHash);
        return receipt;
    } catch (error) {
        console.error('Error removing liquidity:', error);
        throw error;
    }
}

async function swapTokensForETH(tokenAddress: string) {
    try {
        const tokenAmount = parseEther('100'); // Swap 100 tokens
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now

        const response = await axios.post(`${BACKEND_URL}/swap/swap`, {
            tokenIn: tokenAddress,
            tokenOut: 'ETH',
            amountIn: tokenAmount.toString(),
            amountOutMin: '0',
            to: account.address,
            deadline: deadline.toString(),
            path: [tokenAddress, 'ETH']
        });

        const { to, data, value } = response.data;

        const hash = await walletClient.sendTransaction({
            to,
            data,
            value,
            account
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Tokens swapped for ETH, transaction hash:', receipt.transactionHash);
        return receipt;
    } catch (error) {
        console.error('Error swapping tokens for ETH:', error);
        throw error;
    }
}

async function swapETHForTokens(tokenAddress: string) {
    try {
        const ethAmount = parseEther('1'); // Swap 1 ETH
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now

        const response = await axios.post(`${BACKEND_URL}/swap/swap`, {
            tokenIn: 'ETH',
            tokenOut: tokenAddress,
            amountIn: ethAmount.toString(),
            amountOutMin: '0',
            to: account.address,
            deadline: deadline.toString(),
            path: ['ETH', tokenAddress]
        });

        const { to, data, value } = response.data;

        const hash = await walletClient.sendTransaction({
            to,
            data,
            value,
            account
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('ETH swapped for tokens, transaction hash:', receipt.transactionHash);
        return receipt;
    } catch (error) {
        console.error('Error swapping ETH for tokens:', error);
        throw error;
    }
}

async function approveToken(tokenAddress: `0x${string}`, spender: `0x${string}`, amount: bigint) {
    try {
        const hash = await walletClient.writeContract({
            address: tokenAddress,
            abi: ERC20_ABI,
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

async function main() {
    try {
        const tokenAddress = '0x521EcF954A3F2acA4E608322e620f069B5Ff9d1A' as `0x${string}`;
        const wethAddress = '0xF4BFFAD12837369Cb0928815aCfC9a768C8c0eD8' as `0x${string}`;
        const routerAddress = '0xAFAB7513EB80460ABA36d60824d30C61c2E11361' as `0x${string}`;

        const testToken = '0xBC4E821cF2D685b92B7d84f6A510614c33924e1D' as `0x${string}`;

        // Approve token for router (max amount) //! Already approved
        // const maxAmount = parseEther("1000000");
        // await approveToken(tokenAddress, routerAddress, maxAmount);

        // 3. Add initial liquidity
        await addLiquidity(tokenAddress, wethAddress);

        // // 4. Perform swaps
        // await swapTokensForETH(tokenAddress);
        // await swapETHForTokens(tokenAddress);

        // // 5. Remove some liquidity
        // await removeLiquidity(tokenAddress, pairAddress);

        console.log('All operations completed successfully!');
    } catch (error) {
        console.error('Error in main execution:', error);
    }
}

// Execute the script
main(); 