import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './customer/pages/Home';
import CustomerLogin from './customer/pages/Login';
import CustomerSignup from './customer/pages/Signup';
import ProviderDetails from './customer/pages/ProviderDetails';
import BookingFlow from './customer/pages/BookingFlow';
import ProviderLogin from './provider/pages/Login';
import ProviderSignup from './provider/pages/Signup';
import ProviderDashboard from './provider/pages/Dashboard';
import AdminApprovals from './admin/pages/ProviderApprovals';
import ProtectedRoute from './shared/components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/customer/login' element={<CustomerLogin />} />
        <Route path='/customer/signup' element={<CustomerSignup />} />
        <Route path='/customer/provider/:id' element={<ProviderDetails />} />
        <Route path='/customer/book/:id' element={<BookingFlow />} />
        <Route path='/provider/login' element={<ProviderLogin />} />
        <Route path='/provider/signup' element={<ProviderSignup />} />
        <Route path='/provider/*' element={<ProtectedRoute><ProviderDashboard /></ProtectedRoute>} />
        <Route path='/admin/*' element={<ProtectedRoute><AdminApprovals /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
