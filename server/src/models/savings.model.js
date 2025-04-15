import mongoose from "mongoose";

const savingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Authentication',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ''
    },
    lockDate: {
        type: Date,
        required: true
    },
    isLocked: {
        type: Boolean,
        default: true
    },
    transactions: [{
        amount: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['deposit', 'withdrawal'],
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

savingsSchema.methods.addFunds = async function(amount) {
    if (amount <= 0) {
        throw new Error('Amount must be positive');
    }
    
    // Funds can always be added, even if locked, so we don't need to check for lock status here
    this.amount += amount;
    
    this.transactions.push({
        amount,
        type: 'deposit'
    });
    
    return this.save();
};

savingsSchema.methods.withdrawFunds = async function(amount) {
    if (amount <= 0) {
        throw new Error('Amount must be positive');
    }
    
    // Check if saving is locked, but make the comparison at day level precision
    if (this.isLocked) {
        // Get today's date at beginning of day (00:00:00)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get lock date at beginning of day (00:00:00)
        const lockDate = new Date(this.lockDate);
        lockDate.setHours(0, 0, 0, 0);
        
        // Only block withdrawal if lock date is strictly greater than today
        // This allows withdrawals on the same day as the lock date
        if (lockDate > today) {
            throw new Error('Savings is locked until ' + this.lockDate.toDateString());
        }
    }
    
    if (amount > this.amount) {
        throw new Error('Insufficient savings balance');
    }
    
    this.amount -= amount;
    
    this.transactions.push({
        amount,
        type: 'withdrawal'
    });
    
    return this.save();
};

savingsSchema.methods.getTransactionHistory = function() {
    return this.transactions.sort((a, b) => b.timestamp - a.timestamp);
};

const Savings = mongoose.model('Savings', savingsSchema);

export default Savings;
