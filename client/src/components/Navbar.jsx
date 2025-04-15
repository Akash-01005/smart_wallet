import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logOut, isLoading } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-violet-600 to-indigo-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {user && (
              <>
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-white flex items-center">
                    <div className="p-2 bg-white rounded-full shadow-md mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1zm5-1a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="tracking-wide">Smart Wallet</span>
                  </Link>
                </div>
                <div className="hidden sm:ml-10 sm:flex sm:space-x-4">
                  {[
                    { name: 'Home', path: '/' },
                    { name: 'Wallet', path: '/wallet' },
                    { name: 'Savings', path: '/savings' },
                    { name: 'Transactions', path: '/transactions' }
                  ].map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`px-3 py-1 rounded-full my-auto font-medium text-sm ${
                        isActive(item.path)
                          ? 'bg-white text-indigo-700 shadow-md'
                          : 'text-indigo-100 hover:bg-indigo-800 hover:bg-opacity-50 hover:text-white'
                      } transition-all duration-200`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
            {!user && (
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-white flex items-center">
                  <div className="p-2 bg-white rounded-full shadow-md mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1zm5-1a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="tracking-wide">Smart Wallet</span>
                </span>
              </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-indigo-700 font-bold text-lg shadow-md border-2 border-indigo-400">
                    {user.username ? user.username.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-2 text-sm font-medium text-white">
                    {user.username || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-full shadow-md text-sm font-medium text-indigo-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700 disabled:opacity-50 transition duration-150"
                >
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full border-2 border-white text-sm font-medium text-white bg-transparent hover:bg-white hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-white transition duration-200"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-full text-sm font-medium text-indigo-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700 shadow-md transition duration-200"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-full text-white hover:text-gray-200 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-white"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-indigo-800 bg-opacity-95 backdrop-blur-sm`}>
        <div className="pt-2 pb-3 space-y-1 px-3">
          {user && (
            <>
              {[
                { name: 'Home', path: '/' },
                { name: 'Wallet', path: '/wallet' },
                { name: 'Savings', path: '/savings' },
                { name: 'Transactions', path: '/transactions' }
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-4 py-2 rounded-lg ${
                    isActive(item.path)
                      ? 'bg-white text-indigo-700 font-medium'
                      : 'text-white hover:bg-indigo-700'
                  } text-base transition duration-150`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-indigo-500">
          {user ? (
            <>
              <div className="flex items-center px-4 py-2 bg-indigo-700 bg-opacity-50 rounded-lg mx-3 mb-2">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-indigo-700 font-bold text-lg shadow border-2 border-indigo-400">
                    {user.username ? user.username.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {user.username || user.email}
                  </div>
                  <div className="text-sm font-medium text-indigo-200">{user.email}</div>
                </div>
              </div>
              <div className="px-3">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-center rounded-lg text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition duration-150"
                >
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 px-3 py-2">
              <Link
                to="/login"
                className="block px-4 py-2 text-center rounded-lg border border-indigo-400 text-white hover:bg-indigo-700 transition duration-150"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="block px-4 py-2 text-center rounded-lg bg-white text-indigo-700 font-medium hover:bg-gray-100 transition duration-150"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
