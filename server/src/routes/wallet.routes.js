import express from 'express';
import { createWallet, getWallet, addMoney, withdrawMoney, getWalletBalance, getTransactions } from '../controllers/wallet.controller.js';
import verify from '../middleware/verify.middleware.js';

const walletRouter = express.Router();

walletRouter.post('/create', createWallet);
walletRouter.get('/', verify, getWallet);
walletRouter.post('/deposit', addMoney);
walletRouter.post('/withdraw', withdrawMoney);
walletRouter.get('/balance/:userId', getWalletBalance);
walletRouter.get('/transactions/:userId', getTransactions);

export default walletRouter;
