import dotenv from 'dotenv';
import UniswapV2Factory from './ABIs/UniswapV2Factory.json';
import UniswapV2Router02 from './ABIs/UniswapV2Router02.json';
import WETH9 from './ABIs/WETH9.json';
import path from 'path';
import { defineChain, http } from 'viem';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    factoryAddress: process.env.FACTORY_ADDRESS as `0x${string}`,
    routerAddress: process.env.ROUTER_ADDRESS as `0x${string}`,
    WETH: process.env.WETH_ADDRESS as `0x${string}`,
    privateKey: process.env.PRIVATE_KEY as `0x${string}`,
    port: process.env.PORT || 3000,
    corsOrigin: process.env.CORS_ORIGIN || '*'
};

export const ABCTestnet = defineChain({
    id: 112,
    name: 'ABC Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'TEST',
        symbol: 'TEST',
    },
    rpcUrls: {
        default: {
            http: [config.rpcUrl],
        },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://explorer.abc.t.raas.gelato.cloud' },
    },
})

export const FactoryABI = UniswapV2Factory.abi;

export const RouterABI = UniswapV2Router02.abi;

export const WETHABI = WETH9.abi;

// Added minimal PairABI for UniswapV2Pair contract to support getReserves
export const PairABI = [
    {
        constant: true,
        inputs: [],
        name: 'getReserves',
        outputs: [
            { internalType: 'uint112', name: '_reserve0', type: 'uint112' },
            { internalType: 'uint112', name: '_reserve1', type: 'uint112' },
            { internalType: 'uint32', name: '_blockTimestampLast', type: 'uint32' }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'token0',
        outputs: [ { internalType: 'address', name: '', type: 'address' } ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'token1',
        outputs: [ { internalType: 'address', name: '', type: 'address' } ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }
];

export const TokenABI = [
    {
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [ { internalType: 'string', name: '', type: 'string' } ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'symbol',
        outputs: [ { internalType: 'string', name: '', type: 'string' } ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }
];