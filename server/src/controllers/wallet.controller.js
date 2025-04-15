import Wallet from '../models/wallet.model.js';
import mongoose from 'mongoose';

export const createWallet = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        
        let wallet = await Wallet.findOne({ userId });
        
        if (wallet) {
            return res.status(200).json({ 
                message: 'Wallet already exists', 
                wallet: {
                    userId: wallet.userId,
                    balance: wallet.balance,
                    currency: wallet.currency
                } 
            });
        }
        
        wallet = new Wallet({ userId });
        await wallet.save();
        
        return res.status(201).json({ 
            message: 'Wallet created successfully', 
            wallet: {
                userId: wallet.userId,
                balance: wallet.balance,
                currency: wallet.currency
            } 
        });
        
    } catch (error) {
        console.error('Error creating wallet:', error);
        return res.status(500).json({ message: 'Failed to create wallet', error: error.message });
    }
};

export const getWallet = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        const userId = req.user._id;
        
        const wallet = await Wallet.findOne({ userId });
        
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            data: {
                userId: wallet.userId,
                balance: wallet.balance,
                currency: wallet.currency
            }
        });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const addMoney = async (req, res) => {
    try {
        const { userId, amount, description } = req.body;
        
        if (!userId || !amount) {
            return res.status(400).json({ message: 'User ID and amount are required' });
        }
        
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive number' });
        }
        
        let wallet = await Wallet.findOne({ userId });
        
        if (!wallet) {
            wallet = new Wallet({ userId });
        }
        
        await wallet.deposit(amount, description || '');
        
        return res.status(200).json({ 
            message: 'Money added successfully',
            balance: wallet.balance,
            transaction: wallet.transactions[wallet.transactions.length - 1]
        });
        
    } catch (error) {
        console.error('Error adding money:', error);
        return res.status(500).json({ message: 'Failed to add money', error: error.message });
    }
};

export const withdrawMoney = async (req, res) => {
    try {
        const { userId, amount, description } = req.body;
        
        if (!userId || !amount) {
            return res.status(400).json({ message: 'User ID and amount are required' });
        }
        
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive number' });
        }
        
        const wallet = await Wallet.findOne({ userId });
        
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }
        
        try {
            await wallet.withdraw(amount, description || '');
            
            return res.status(200).json({ 
                message: 'Money withdrawn successfully',
                balance: wallet.balance,
                transaction: wallet.transactions[wallet.transactions.length - 1]
            });
        } catch (error) {
            if (error.message === 'Insufficient balance') {
                return res.status(400).json({ message: error.message });
            }
            throw error;
        }
        
    } catch (error) {
        console.error('Error withdrawing money:', error);
        return res.status(500).json({ message: 'Failed to withdraw money', error: error.message });
    }
};

export const getWalletBalance = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        
        const wallet = await Wallet.findOne({ userId });
        
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }
        
        return res.status(200).json({ 
            balance: wallet.balance,
            currency: wallet.currency
        });
        
    } catch (error) {
        console.error('Error getting wallet balance:', error);
        return res.status(500).json({ message: 'Failed to get wallet balance', error: error.message });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        
        const wallet = await Wallet.findOne({ userId });
        
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }
        
        const transactions = wallet.getTransactionHistory();
        
        return res.status(200).json({ 
            userId: wallet.userId,
            balance: wallet.balance,
            currency: wallet.currency,
            transactions
        });
        
    } catch (error) {
        console.error('Error getting transactions:', error);
        return res.status(500).json({ message: 'Failed to get transactions', error: error.message });
    }
};
