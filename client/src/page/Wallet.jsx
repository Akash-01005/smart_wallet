import React, { useState, useEffect } from 'react';
import useWalletStore from '../store/useWalletStore';
import useAuthStore from '../store/useAuthStore';

const Wallet = () => {
  const { user } = useAuthStore();
  const { 
    balance, 
    currency, 
    isLoading, 
    addMoney, 
    withdrawMoney, 
    getWalletBalance, 
    createWallet,
    error
  } = useWalletStore();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState('add');

  useEffect(() => {
    const initWallet = async () => {
      if (user) {
        try {
          const walletData = await getWalletBalance(user._id);
          if (!walletData || error === 'Wallet not found') {
            await createWallet(user._id);
          }
        } catch (err) {
          if (err.response?.status === 404) {
            await createWallet(user._id);
          }
        }
      }
    };

    initWallet();
  }, [user]);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return;
    }
    
    if (user) {
      const success = await addMoney(user._id, amount, description);
      if (success) {
        setAmount('');
        setDescription('');
      }
    }
  };

  const handleWithdrawMoney = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return;
    }
    
    if (user) {
      const success = await withdrawMoney(user._id, amount, description);
      if (success) {
        setAmount('');
        setDescription('');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wallet</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Balance</h2>
          <p className="text-3xl font-bold text-indigo-600">{currency} {balance.toFixed(2)}</p>
        </div>
        
        <div className="mb-6">
          <div className="flex border-b">
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'add' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('add')}
            >
              Add Money
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'withdraw' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('withdraw')}
            >
              Withdraw Money
            </button>
          </div>
          
          {activeTab === 'add' ? (
            <form onSubmit={handleAddMoney} className="mt-4">
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  min="1"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Add Money'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleWithdrawMoney} className="mt-4">
              <div className="mb-4">
                <label htmlFor="withdraw-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  id="withdraw-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  min="1"
                  max={balance}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="withdraw-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  id="withdraw-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || Number(amount) > balance}
                className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Withdraw Money'}
              </button>
              {Number(amount) > balance && (
                <p className="mt-2 text-sm text-red-600">Insufficient balance</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet; 