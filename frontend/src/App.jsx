import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './customer/pages/Home';
import CustomerLogin from './customer/pages/Login';
import CustomerSignup from './customer/pages/Signup';
import ProviderDetails from './customer/pages/ProviderDetails';
import BookingFlow from './customer/pages/BookingFlow';
import CustomerOrders from './customer/pages/CustomerOrders';
import StyleInspirationFeed from './customer/pages/StyleInspirationFeed';
import SubscriptionsManager from './customer/pages/SubscriptionsManager';
import AddressBookManager from './customer/pages/AddressBookManager';
import GiftVouchersPage from './customer/pages/GiftVouchersPage';
import ReferralLoyaltyHub from './customer/pages/ReferralLoyaltyHub';

import ProviderLogin from './provider/pages/Login';
import ProviderSignup from './provider/pages/Signup';
import ProviderDashboard from './provider/pages/Dashboard';
import CoverageZoneDrawer from './provider/pages/CoverageZoneDrawer';
import SmartRouteOptimizer from './provider/pages/SmartRouteOptimizer';
import ClientCRMNotes from './provider/pages/ClientCRMNotes';
import CalendarSyncSettings from './provider/pages/CalendarSyncSettings';
import InstantPayoutsDashboard from './provider/pages/InstantPayoutsDashboard';

import AdminApprovals from './admin/pages/ProviderApprovals';
import ArchitectureSpecPage from './admin/pages/ArchitectureSpecPage';
import ProtectedRoute from './shared/components/ProtectedRoute';
import Navbar from './shared/components/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/customer/login' element={<CustomerLogin />} />
            <Route path='/customer/signup' element={<CustomerSignup />} />
            <Route path='/customer/orders' element={<CustomerOrders />} />
            <Route path='/customer/provider/:id' element={<ProviderDetails />} />
            <Route path='/customer/book/:id' element={<BookingFlow />} />
            <Route path='/customer/style-feed' element={<StyleInspirationFeed />} />
            <Route path='/customer/subscriptions' element={<SubscriptionsManager />} />
            <Route path='/customer/addresses' element={<AddressBookManager />} />
            <Route path='/customer/vouchers' element={<GiftVouchersPage />} />
            <Route path='/customer/rewards' element={<ReferralLoyaltyHub />} />

            <Route path='/provider/login' element={<ProviderLogin />} />
            <Route path='/provider/signup' element={<ProviderSignup />} />
            <Route path='/provider/coverage-zone' element={<CoverageZoneDrawer />} />
            <Route path='/provider/route-optimizer' element={<SmartRouteOptimizer />} />
            <Route path='/provider/client-crm' element={<ClientCRMNotes />} />
            <Route path='/provider/calendar-sync' element={<CalendarSyncSettings />} />
            <Route path='/provider/payouts' element={<InstantPayoutsDashboard />} />
            <Route path='/provider/*' element={<ProtectedRoute><ProviderDashboard /></ProtectedRoute>} />

            <Route path='/admin/*' element={<ProtectedRoute><AdminApprovals /></ProtectedRoute>} />
            <Route path='/docs/architecture' element={<ArchitectureSpecPage />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">DropIn v2.0</span> — At-Home Grooming & Beauty Marketplace ("Wolt for Barbers")
            </div>
            <p>© {new Date().getFullYear()} DropIn Services Inc. Ultra-fast barber & beauty delivery.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
