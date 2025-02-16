import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ABCTestnet, config } from '../config';

export const publicClient = createPublicClient({
    chain: ABCTestnet,
    transport: http(config.rpcUrl)
});

const account = privateKeyToAccount(config.privateKey);

export const walletClient = createWalletClient({
    account,
    chain: ABCTestnet,
    transport: http(config.rpcUrl)
});
