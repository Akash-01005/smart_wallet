import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['deposit', 'withdrawal'],
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Authentication',
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    transactions: [transactionSchema]
}, { timestamps: true });


walletSchema.methods.deposit = async function(amount, description = '') {
    if (amount <= 0) {
        throw new Error('Deposit amount must be positive');
    }
    
    this.balance += amount;
    
    this.transactions.push({
        amount,
        type: 'deposit',
        description,
        balanceAfter: this.balance
    });
    
    return this.save();
};

walletSchema.methods.withdraw = async function(amount, description = '') {
    if (amount <= 0) {
        throw new Error('Withdrawal amount must be positive');
    }
    
    if (amount > this.balance) {
        throw new Error('Insufficient balance');
    }
    
    this.balance -= amount;
    
    this.transactions.push({
        amount,
        type: 'withdrawal',
        description,
        balanceAfter: this.balance
    });
    
    return this.save();
};

walletSchema.methods.getTransactionHistory = function() {
    return this.transactions.sort((a, b) => b.timestamp - a.timestamp);
};

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;
