import express from 'express';
import { executeTransaction, estimateGas } from '../controllers/transactionController';

const router = express.Router();

// Route to execute a blockchain transaction
router.post('/transaction', executeTransaction);

// Route to estimate gas for a transaction
router.post('/estimate', estimateGas);

export default router;
