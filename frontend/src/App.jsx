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
import FleetManagementPortal from './provider/pages/FleetManagementPortal';

import AdminApprovals from './admin/pages/ProviderApprovals';
import ArchitectureSpecPage from './admin/pages/ArchitectureSpecPage';
import SystemHealthStatusPage from './admin/pages/SystemHealthStatusPage';
import ProtectedRoute from './shared/components/ProtectedRoute';
import Navbar from './shared/components/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 antialiased bg-texture-grain">
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
            <Route path='/provider/fleet' element={<FleetManagementPortal />} />
            <Route path='/provider/*' element={<ProtectedRoute><ProviderDashboard /></ProtectedRoute>} />

            <Route path='/admin/*' element={<ProtectedRoute><AdminApprovals /></ProtectedRoute>} />
            <Route path='/status' element={<SystemHealthStatusPage />} />
            <Route path='/docs/architecture' element={<ArchitectureSpecPage />} />
          </Routes>
        </main>
        <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] py-8 text-center text-xs text-[var(--text-muted)]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-[var(--text-primary)]">DropInn Marketplace</span> — At-Home Grooming & Barbering ("Accessible Premium Lifestyle")
            </div>
            <div className="flex items-center gap-4 text-[var(--text-secondary)] font-medium">
              <a href="/status" className="hover:text-amber-500 font-mono text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                System Health (#50)
              </a>
              <a href="/docs/architecture" className="hover:text-amber-500 text-[11px]">
                Architecture Spec
              </a>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
