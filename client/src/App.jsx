import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Home, Login, Signup, Wallet, Savings, Transactions } from './page'
import useAuthStore from './store/useAuthStore';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components';

const App = () => {
  const { user, checkAuth } = useAuthStore();
  useEffect(()=>{
    checkAuth();
  },[checkAuth]);

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={user ? <Home /> : <Navigate to='/login' />} />
        <Route path='/login' element={user ? <Navigate to='/' /> : <Login />} />
        <Route path='/signup' element={user ? <Navigate to='/' /> : <Signup />} />
        <Route path='/wallet' element={user ? <Wallet /> : <Navigate to='/login' />} />
        <Route path='/savings' element={user ? <Savings /> : <Navigate to='/login' />} />
        <Route path='/transactions' element={user ? <Transactions /> : <Navigate to='/login' />} />
      </Routes>
      <Toaster position='top-center' containerClassName='mt-30' />
    </div>
  )
}

export default App