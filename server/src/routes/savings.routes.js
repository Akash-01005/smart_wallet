import express from 'express';
import verify from '../middleware/verify.middleware.js';
import {
    getAllSavings,
    getSavingsById,
    createSavings,
    addToSavings,
    withdrawFromSavings,
    deleteSavings,
    lockSavings
} from '../controllers/savings.controller.js';

const savingsRouter = express.Router();

savingsRouter.use(verify);

savingsRouter.get('/', getAllSavings);
savingsRouter.get('/:id', getSavingsById);
savingsRouter.post('/', createSavings);
savingsRouter.put('/:id/add', addToSavings);
savingsRouter.put('/:id/withdraw', withdrawFromSavings);
savingsRouter.put('/:id/lock', lockSavings);
savingsRouter.delete('/:id', deleteSavings);

export default savingsRouter;
