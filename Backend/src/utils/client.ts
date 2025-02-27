import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ABCTestnet, config } from '../config';

export const publicClient = createPublicClient({
    chain: ABCTestnet,
    transport: http(config.rpcUrl)
});


export const writeClient = createWalletClient({
    chain: ABCTestnet,
    transport: http(config.rpcUrl),
    account: privateKeyToAccount(config.privateKey)
});


