import React from 'react'
import { Link } from 'react-router-dom'
import { FaWallet, FaPiggyBank, FaExchangeAlt } from 'react-icons/fa'

const Home = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 max-w-4xl text-center">
        <h1 className="text-4xl font-bold mb-8 text-indigo-600">Smart Wallet</h1>
        <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
          Manage your finances with ease. Track your expenses, set savings goals, and take control of your financial journey.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link 
            to="/wallet" 
            className="flex flex-col items-center bg-white shadow-lg hover:shadow-xl rounded-lg p-6 transition duration-300 transform hover:-translate-y-1"
          >
            <FaWallet className="text-4xl text-blue-500 mb-4" />
            <span className="font-medium text-gray-800">Wallet</span>
            <p className="text-sm text-gray-500 mt-2">Manage your balance</p>
          </Link>
          
          <Link 
            to="/savings" 
            className="flex flex-col items-center bg-white shadow-lg hover:shadow-xl rounded-lg p-6 transition duration-300 transform hover:-translate-y-1"
          >
            <FaPiggyBank className="text-4xl text-purple-500 mb-4" />
            <span className="font-medium text-gray-800">Savings</span>
            <p className="text-sm text-gray-500 mt-2">Set financial goals</p>
          </Link>
          
          <Link 
            to="/transactions" 
            className="flex flex-col items-center bg-white shadow-lg hover:shadow-xl rounded-lg p-6 transition duration-300 transform hover:-translate-y-1"
          >
            <FaExchangeAlt className="text-4xl text-green-500 mb-4" />
            <span className="font-medium text-gray-800">Transactions</span>
            <p className="text-sm text-gray-500 mt-2">View your history</p>
          </Link>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Start Your Financial Journey Today</h2>
          <p className="text-gray-600 mb-6">
            Track your expenses, create savings goals, and manage your finances all in one place.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/wallet" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home