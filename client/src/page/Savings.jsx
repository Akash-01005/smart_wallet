import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const Savings = () => {
  const { user } = useAuthStore();
  const [savings, setSavings] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedSavings, setSelectedSavings] = useState(null);
  const [totalSavings, setTotalSavings] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    description: '',
    lockDate: ''
  });
  const [transferAmount, setTransferAmount] = useState('');
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user && user._id) {
      localStorage.setItem('userId', user._id);
    }
    fetchSavings();
    fetchWalletBalance();
  }, [user]);

  const fetchSavings = async () => {
    try {
      console.log('Fetching savings from:', `${API_URL}/api/savings`);
      const res = await axios.get(`${API_URL}/api/savings`, {
        withCredentials: true,
      });
      console.log('Savings response:', res.data);
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setSavings(res.data.data);
        calculateTotalSavings(res.data.data);
      } else {
        setSavings([]);
        setTotalSavings(0);
      }
    } catch (error) {
      console.error('Error fetching savings:', error);
      toast.error('Failed to fetch savings');
      setSavings([]);
      setTotalSavings(0);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found in localStorage');
        setWalletBalance(0);
        return;
      }
      
      console.log('Fetching wallet balance from:', `${API_URL}/api/wallet/balance/${userId}`);
      const res = await axios.get(`${API_URL}/api/wallet/balance/${userId}`, {
        withCredentials: true,
      });
      console.log('Wallet balance response:', res.data);
      
      if (res.data && res.data.balance) {
        setWalletBalance(res.data.balance);
      } else {
        setWalletBalance(0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletBalance(0);
    }
  };

  const calculateTotalSavings = (savingsData) => {
    if (!Array.isArray(savingsData)) return setTotalSavings(0);
    
    const total = savingsData.reduce((sum, item) => sum + (item.amount || 0), 0);
    setTotalSavings(total);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    
    if (name === 'amount') {
      setError('');
    }
  };

  const validateWalletBalance = (amount) => {
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number');
      return false;
    }
    
    if (amountNum > walletBalance) {
      setError('Insufficient wallet balance');
      return false;
    }
    
    return true;
  };

  const handleCreateSavings = async (e) => {
    e.preventDefault();
    
    if (!validateWalletBalance(formData.amount)) {
      return;
    }
    
    setLoading(true);
    try {
      console.log('Creating savings with data:', {
        name: formData.name,
        amount: parseFloat(formData.amount),
        description: formData.description,
        lockDate: formData.lockDate
      });
      
      const response = await axios.post(`${API_URL}/api/savings`, {
        name: formData.name,
        amount: parseFloat(formData.amount),
        description: formData.description,
        lockDate: formData.lockDate
      }, {
        withCredentials: true,
      });
      
      console.log('Savings creation response:', response.data);
      
      toast.success('Savings goal created successfully');
      setFormData({
        name: '',
        amount: '',
        description: '',
        lockDate: ''
      });
      setShowCreateModal(false);
      fetchSavings();
      fetchWalletBalance();
    } catch (error) {
      console.error('Error creating savings:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to create savings goal');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToSavings = async (e) => {
    e.preventDefault();
    
    if (!validateWalletBalance(transferAmount)) {
      return;
    }
    
    if (!selectedSavings) return;
    
    setLoading(true);
    try {
      await axios.put(`${API_URL}/api/savings/${selectedSavings._id}/add`, 
        { amount: parseFloat(transferAmount) }, 
        { withCredentials: true }
      );
      
      toast.success(`Added to ${selectedSavings.name} savings`);
      setTransferAmount('');
      setShowAddModal(false);
      fetchSavings();
      fetchWalletBalance();
    } catch (error) {
      console.error('Error adding to savings:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to add to savings');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawFromSavings = async (e) => {
    e.preventDefault();
    
    if (!selectedSavings) return;
    
    
    if (isLocked(selectedSavings)) {
      setError(`Cannot withdraw until ${formatDate(selectedSavings.lockDate)}`);
      return;
    }
    
    const amountNum = parseFloat(transferAmount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number');
      return;
    }
    
    if (amountNum > selectedSavings.amount) {
      setError('Insufficient savings balance');
      return;
    }
    
    setLoading(true);
    try {
      await axios.put(`${API_URL}/api/savings/${selectedSavings._id}/withdraw`, 
        { amount: amountNum }, 
        { withCredentials: true }
      );
      
      toast.success(`Withdrawn from ${selectedSavings.name} savings`);
      setTransferAmount('');
      setError('');
      setShowWithdrawModal(false);
      fetchSavings();
      fetchWalletBalance();
    } catch (error) {
      console.error('Error withdrawing from savings:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to withdraw from savings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSavings = async (id) => {
    
    const savingToDelete = savings.find(saving => saving._id === id);
    
    if (!savingToDelete) {
      toast.error('Savings not found');
      return;
    }
    
    
    if (isLocked(savingToDelete)) {
      toast.error(`Cannot delete savings until ${formatDate(savingToDelete.lockDate)}`);
      return;
    }
    
    try {
      if (window.confirm('Are you sure you want to delete this savings goal?')) {
        setLoading(true);
        await axios.delete(`${API_URL}/api/savings/${id}`, {
          withCredentials: true,
        });
        
        toast.success('Savings goal deleted successfully');
        fetchSavings();
        fetchWalletBalance();
      }
    } catch (error) {
      console.error('Error deleting savings:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to delete savings goal');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (saving) => {
    setSelectedSavings(saving);
    setTransferAmount('');
    setError('');
    setShowAddModal(true);
  };

  const openWithdrawModal = (saving) => {
    if (isLocked(saving)) {
      toast.error(`Cannot withdraw until ${formatDate(saving.lockDate)}`);
      return;
    }
    
    setSelectedSavings(saving);
    setTransferAmount('');
    setError('');
    setShowWithdrawModal(true);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isLocked = (saving) => {
    return saving.isLocked && new Date() < new Date(saving.lockDate);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Savings</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
        >
          Create New Goal
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Total Savings</h2>
          <p className="text-3xl font-bold text-indigo-600">₹{totalSavings.toFixed(2)}</p>
        </div>
        <div className="text-sm text-gray-600">
          <p>Available in wallet: ₹{walletBalance.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savings && savings.length > 0 ? (
          savings.map((saving) => (
            <div key={saving._id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg mb-2">{saving.name}</h3>
                <button 
                  onClick={() => handleDeleteSavings(saving._id)}
                  className={`text-red-500 hover:text-red-700 ${isLocked(saving) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isLocked(saving) || loading}
                  title={isLocked(saving) ? `Locked until ${formatDate(saving.lockDate)}` : 'Delete savings'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="mb-3">
                <p className="text-xl font-bold text-indigo-600">₹{saving.amount.toFixed(2)}</p>
                {saving.description && <p className="text-gray-600 text-sm mt-1">{saving.description}</p>}
              </div>
              <div className="mb-3 text-sm">
                <p className={`${isLocked(saving) ? 'text-red-500' : 'text-green-500'} flex items-center`}>
                  {isLocked(saving) ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Locked until {formatDate(saving.lockDate)}
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      Available for transactions
                    </>
                  )}
                </p>
              </div>
              <div className="flex space-x-2 mt-2">
                <button 
                  onClick={() => openAddModal(saving)}
                  className={`bg-green-500 text-white py-1 px-3 rounded text-sm hover:bg-green-600 flex-1 ${isLocked(saving) ? 'opacity-70' : ''}`}
                  disabled={loading}
                  title="You can always add to your savings"
                >
                  Add
                </button>
                <button 
                  onClick={() => openWithdrawModal(saving)}
                  className={`bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600 flex-1 ${isLocked(saving) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isLocked(saving) || loading}
                  title={isLocked(saving) ? `Cannot withdraw until ${formatDate(saving.lockDate)}` : 'Withdraw from savings'}
                >
                  Withdraw
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full border rounded p-4 bg-white">
            <h3 className="font-semibold mb-2">No savings goals yet</h3>
            <p className="text-gray-600 mb-4">Create a savings goal to get started</p>
          </div>
        )}
      </div>
      
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Savings Goal</h2>
            <form onSubmit={handleCreateSavings}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${error ? 'border-red-500' : ''}`}
                  min="1"
                  step="0.01"
                  required
                />
                {error ? (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Available: ₹{walletBalance.toFixed(2)}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Lock Until</label>
                <div className="relative">
                  <input
                    type="date"
                    name="lockDate"
                    value={formData.lockDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-amber-500">Note:</span> You cannot withdraw or delete savings until this date
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                  }}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showAddModal && selectedSavings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add to "{selectedSavings.name}"</h2>
            <form onSubmit={handleAddToSavings}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => {
                    setTransferAmount(e.target.value);
                    setError('');
                  }}
                  className={`w-full p-2 border rounded ${error ? 'border-red-500' : ''}`}
                  min="1"
                  step="0.01"
                  required
                />
                {error ? (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Available: ₹{walletBalance.toFixed(2)}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                  }}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showWithdrawModal && selectedSavings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Withdraw from "{selectedSavings.name}"</h2>
            <form onSubmit={handleWithdrawFromSavings}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => {
                    setTransferAmount(e.target.value);
                    setError('');
                  }}
                  className={`w-full p-2 border rounded ${error ? 'border-red-500' : ''}`}
                  min="1"
                  max={selectedSavings.amount}
                  step="0.01"
                  required
                />
                {error ? (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Available: ₹{selectedSavings.amount.toFixed(2)}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setError('');
                  }}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? 'Withdrawing...' : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings; 