import express from 'express';
import { authenticate } from '../middleware/auth';
import { getWalletBalances, updateBalance ,  getSupportedCurrencies } from '../controllers/walletController';

const router = express.Router();

// All wallet routes require authentication
router.use(authenticate);

router.get('/balances', getWalletBalances);
router.post('/update-balance', updateBalance);
router.get('/supported-currencies', getSupportedCurrencies);

export default router;
