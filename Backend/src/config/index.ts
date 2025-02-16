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
    WETH: process.env.WETH as `0x${string}`,
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