import React, { useEffect, useState } from 'react';
import useWalletStore from '../store/useWalletStore';
import useAuthStore from '../store/useAuthStore';

const Transactions = () => {
  const { user } = useAuthStore();
  const { getTransactions, transactions, currency, isLoading } = useWalletStore();
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showSavingsOnly, setShowSavingsOnly] = useState(false);

  useEffect(() => {
    if (user) {
      getTransactions(user._id);
    }
  }, [user]);

  const filteredTransactions = transactions.filter(transaction => {
    // Filter by transaction type
    if (filter !== 'all' && transaction.type !== filter) {
      return false;
    }

    // Filter savings-related transactions
    if (showSavingsOnly && !transaction.description?.toLowerCase().includes('savings')) {
      return false;
    }

    // Filter by date range
    if (startDate && endDate) {
      const transactionDate = new Date(transaction.timestamp);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Set to end of day

      return transactionDate >= start && transactionDate <= end;
    }

    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resetFilters = () => {
    setFilter('all');
    setStartDate('');
    setEndDate('');
    setShowSavingsOnly(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Recent Transactions</h2>
            <button
              onClick={resetFilters}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Reset Filters
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-2">
            <div className="flex flex-1 flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded p-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded p-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="sm:self-end">
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                id="type-filter"
                className="w-full sm:w-auto border rounded p-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Transactions</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
              </select>
            </div>
          </div>

          <div className="mt-3">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                checked={showSavingsOnly}
                onChange={(e) => setShowSavingsOnly(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">Show savings transactions only</span>
            </label>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions found</p>
            </div>
          ) : (
            <ul className="divide-y">
              {filteredTransactions.map((transaction, index) => (
                <li key={index} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${transaction.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <p className="font-medium capitalize">{transaction.type}</p>
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                    {transaction.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {transaction.description}
                        {transaction.description.toLowerCase().includes('savings') && (
                          <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            Savings
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'deposit' ? '+' : '-'}{currency} {transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Balance: {currency} {transaction.balanceAfter.toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions; 