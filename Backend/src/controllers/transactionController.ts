import { Request, Response } from 'express';
import { writeClient, publicClient } from '../utils/client';
import { isAddress } from 'viem';

/**
 * Execute a blockchain transaction
 * Sends a transaction directly to the blockchain using the writeClient
 */
export const executeTransaction = async (req: Request, res: Response) => {
    try {
        const { to, data, value } = req.body;

        // Validate input parameters
        if (!isAddress(to)) {
            return res.status(400).json({ error: 'Invalid target address provided' });
        }

        if (!data || typeof data !== 'string' || !data.startsWith('0x')) {
            return res.status(400).json({ error: 'Invalid transaction data provided' });
        }

        // Convert value to BigInt, default to 0 if not provided
        const valueInWei = value ? BigInt(value) : 0n;

        try {
            // Send transaction using writeClient
            const hash = await writeClient.sendTransaction({
                to: to as `0x${string}`,
                data: data as `0x${string}`,
                value: valueInWei
            });

            // Wait for transaction receipt
            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            res.json({
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber.toString(),
                gasUsed: receipt.gasUsed.toString(),
                status: receipt.status
            });
        } catch (txError) {
            return res.status(400).json({
                error: 'Transaction failed',
                details: txError instanceof Error ? txError.message : 'Unknown error'
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
 * Estimate gas for a transaction
 * Calculates the estimated gas cost for a transaction before executing it
 */
export const estimateGas = async (req: Request, res: Response) => {
    try {
        const { to, data, value } = req.body;

        // Validate input parameters
        if (!isAddress(to)) {
            return res.status(400).json({ error: 'Invalid target address provided' });
        }

        if (!data || typeof data !== 'string' || !data.startsWith('0x')) {
            return res.status(400).json({ error: 'Invalid transaction data provided' });
        }

        // Convert value to BigInt, default to 0 if not provided
        const valueInWei = value ? BigInt(value) : 0n;

        try {
            // Get current gas price
            const gasPrice = await publicClient.getGasPrice();

            // Estimate gas
            const gasEstimate = await publicClient.estimateGas({
                to: to as `0x${string}`,
                data: data as `0x${string}`,
                value: valueInWei
            });

            // Calculate total gas cost
            const gasCost = gasEstimate * gasPrice;

            res.json({
                gasEstimate: gasEstimate.toString(),
                gasPrice: gasPrice.toString(),
                estimatedCost: gasCost.toString()
            });
        } catch (estimateError) {
            return res.status(400).json({
                error: 'Gas estimation failed',
                details: estimateError instanceof Error ? estimateError.message : 'Unknown error'
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