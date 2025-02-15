import { createPublicClient, http, createWalletClient } from 'viem';
import { hardhat } from 'viem/chains';
import { config } from '../config';

export const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(config.rpcUrl)
});

export const walletClient = createWalletClient({
  chain: hardhat,
  transport: http(config.rpcUrl)
});
