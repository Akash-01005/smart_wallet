import Savings from '../models/savings.model.js';
import Wallet from '../models/wallet.model.js';

export const getAllSavings = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        const userId = req.user._id;
        const savings = await Savings.find({ userId });
        
        // Get today's date at the beginning of the day (00:00:00)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Automatically update the isLocked status if lock date has been reached
        for (const saving of savings) {
            if (saving.isLocked) {
                const lockDate = new Date(saving.lockDate);
                lockDate.setHours(0, 0, 0, 0);
                
                // If lock date is today or in the past, unlock the savings
                if (lockDate <= today) {
                    saving.isLocked = false;
                    await saving.save();
                    console.log(`Savings ${saving._id} automatically unlocked on lock date ${lockDate.toDateString()}`);
                }
            }
        }
        
        res.status(200).json({
            success: true,
            data: savings
        });
    } catch (error) {
        console.error('Error fetching all savings:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getSavingsById = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        const userId = req.user._id;
        const savingsId = req.params.id;
        
        const savings = await Savings.findOne({ _id: savingsId, userId });
        
        if (!savings) {
            return res.status(404).json({
                success: false,
                message: "Savings not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: savings
        });
    } catch (error) {
        console.error('Error fetching savings by ID:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const createSavings = async (req, res) => {
    try {
        console.log('Creating savings with data:', req.body);
        console.log('User info:', req.user);
        
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        const userId = req.user._id;
        const { name, amount, description, lockDate } = req.body;
        
        console.log('Parsed values:', { userId, name, amount, description, lockDate });
        
        if (!name || !amount || !lockDate) {
            return res.status(400).json({
                success: false,
                message: "Name, amount, and lock date are required"
            });
        }
        
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be positive"
            });
        }
        
        const wallet = await Wallet.findOne({ userId });
        console.log('Wallet found:', wallet ? `Balance: ${wallet.balance}` : 'No wallet found');
        
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found"
            });
        }
        
        if (wallet.balance < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient wallet balance"
            });
        }
        
        await wallet.withdraw(amount, `Transfer to savings: ${name}`);
        console.log('Successfully withdrew from wallet, new balance:', wallet.balance);
        
        const savings = new Savings({
            userId,
            name,
            amount,
            description: description || '',
            lockDate: new Date(lockDate),
            transactions: [{
                amount,
                type: 'deposit'
            }]
        });
        
        await savings.save();
        console.log('Savings created successfully:', savings._id);
        
        res.status(201).json({
            success: true,
            data: savings
        });
    } catch (error) {
        console.error('Error creating savings:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const addToSavings = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        const userId = req.user._id;
        const savingsId = req.params.id;
        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a positive number"
            });
        }
        
        const savings = await Savings.findOne({ _id: savingsId, userId });
        
        if (!savings) {
            return res.status(404).json({
                success: false,
                message: "Savings not found"
            });
        }
        
        if (savings.isLocked && new Date() < savings.lockDate) {
            return res.status(400).json({
                success: false,
                message: `Savings is locked until ${savings.lockDate.toDateString()}`
            });
        }
        
        const wallet = await Wallet.findOne({ userId });
        
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found"
            });
        }
        
        if (wallet.balance < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient wallet balance"
            });
        }
        
        await wallet.withdraw(amount, `Transfer to savings: ${savings.name}`);
        await savings.addFunds(amount);
        
        res.status(200).json({
            success: true,
            data: savings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const withdrawFromSavings = async (req, res) => {
    try {
        console.log('Attempting to withdraw from savings');
        
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        const userId = req.user._id;
        const savingsId = req.params.id;
        const { amount, sendToWallet = true } = req.body; // Default to true if not specified
        
        console.log(`Withdrawal request: amount=${amount}, sendToWallet=${sendToWallet}`);
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a positive number"
            });
        }
        
        const savings = await Savings.findOne({ _id: savingsId, userId });
        
        if (!savings) {
            return res.status(404).json({
                success: false,
                message: "Savings not found"
            });
        }
        
        // Check if savings is locked with a clear error message
        // Compare dates at day level precision (ignoring hours/minutes)
        // This allows withdrawals on the same day as the lock date
        if (savings.isLocked) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const lockDate = new Date(savings.lockDate);
            lockDate.setHours(0, 0, 0, 0);
            
            if (lockDate > today) {
                return res.status(400).json({
                    success: false,
                    message: `Savings is locked until ${savings.lockDate.toDateString()} and cannot be withdrawn`
                });
            }
        }
        
        if (savings.amount < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient savings amount"
            });
        }
        
        // Start a transaction to ensure both operations succeed or fail together
        // First, withdraw from savings
        await savings.withdrawFunds(amount);
        
        // Only deposit to wallet if sendToWallet is true
        if (sendToWallet) {
            const wallet = await Wallet.findOne({ userId });
            
            if (!wallet) {
                // Rollback the savings withdrawal if wallet not found
                await savings.addFunds(amount);
                return res.status(404).json({
                    success: false,
                    message: "Wallet not found"
                });
            }
            
            await wallet.deposit(amount, `Transfer from savings: ${savings.name}`);
            console.log(`Deposited ${amount} to wallet from savings: ${savings.name}`);
        } else {
            console.log(`Withdrawn ${amount} from savings: ${savings.name} without wallet deposit`);
        }
        
        res.status(200).json({
            success: true,
            data: savings,
            message: sendToWallet 
                ? `Successfully withdrew ${amount} and added to wallet` 
                : `Successfully withdrew ${amount} from savings`
        });
    } catch (error) {
        console.error('Error withdrawing from savings:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteSavings = async (req, res) => {
    try {
        console.log('Attempting to delete savings');
        
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        const userId = req.user._id;
        const savingsId = req.params.id;
        
        const savings = await Savings.findOne({ _id: savingsId, userId });
        
        if (!savings) {
            return res.status(404).json({
                success: false,
                message: "Savings not found"
            });
        }
        
        // Check if savings is locked using day-level precision
        // This allows deletion on the exact day of the lock date
        if (savings.isLocked) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const lockDate = new Date(savings.lockDate);
            lockDate.setHours(0, 0, 0, 0);
            
            if (lockDate > today) {
                return res.status(400).json({
                    success: false,
                    message: `Savings is locked until ${savings.lockDate.toDateString()} and cannot be deleted`
                });
            }
        }
        
        if (savings.amount > 0) {
            const wallet = await Wallet.findOne({ userId });
            
            if (!wallet) {
                return res.status(404).json({
                    success: false,
                    message: "Wallet not found"
                });
            }
            
            await wallet.deposit(savings.amount, `Refund from deleted savings: ${savings.name}`);
        }
        
        await Savings.deleteOne({ _id: savingsId });
        
        res.status(200).json({
            success: true,
            message: "Savings deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting savings:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const lockSavings = async (req, res) => {
    try {
        console.log('Attempting to lock savings');
        
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        const userId = req.user._id;
        const savingsId = req.params.id;
        const { lockDate } = req.body;
        
        if (!lockDate) {
            return res.status(400).json({
                success: false,
                message: "Lock date is required"
            });
        }
        
        // Make sure lock date is in the future
        const newLockDate = new Date(lockDate);
        if (newLockDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Lock date must be in the future"
            });
        }
        
        const savings = await Savings.findOne({ _id: savingsId, userId });
        
        if (!savings) {
            return res.status(404).json({
                success: false,
                message: "Savings not found"
            });
        }
        
        // If the savings is already locked, return an error
        if (savings.isLocked && new Date() < savings.lockDate) {
            return res.status(400).json({
                success: false,
                message: `Savings is already locked until ${savings.lockDate.toDateString()}`
            });
        }
        
        // Update the savings to be locked
        savings.isLocked = true;
        savings.lockDate = newLockDate;
        await savings.save();
        
        res.status(200).json({
            success: true,
            message: `Savings locked until ${newLockDate.toDateString()}`,
            data: savings
        });
    } catch (error) {
        console.error('Error locking savings:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
