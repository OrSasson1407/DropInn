import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './shared/components/ProtectedRoute';
import Navbar from './shared/components/Navbar';

const Home = lazy(() => import('./customer/pages/Home'));
const CustomerLogin = lazy(() => import('./customer/pages/Login'));
const CustomerSignup = lazy(() => import('./customer/pages/Signup'));
const ProviderDetails = lazy(() => import('./customer/pages/ProviderDetails'));
const BookingFlow = lazy(() => import('./customer/pages/BookingFlow'));
const CustomerOrders = lazy(() => import('./customer/pages/CustomerOrders'));
const StyleInspirationFeed = lazy(() => import('./customer/pages/StyleInspirationFeed'));
const SubscriptionsManager = lazy(() => import('./customer/pages/SubscriptionsManager'));
const AddressBookManager = lazy(() => import('./customer/pages/AddressBookManager'));
const GiftVouchersPage = lazy(() => import('./customer/pages/GiftVouchersPage'));
const ReferralLoyaltyHub = lazy(() => import('./customer/pages/ReferralLoyaltyHub'));

const ProviderLogin = lazy(() => import('./provider/pages/Login'));
const ProviderSignup = lazy(() => import('./provider/pages/Signup'));
const ProviderDashboard = lazy(() => import('./provider/pages/Dashboard'));
const CoverageZoneDrawer = lazy(() => import('./provider/pages/CoverageZoneDrawer'));
const SmartRouteOptimizer = lazy(() => import('./provider/pages/SmartRouteOptimizer'));
const ClientCRMNotes = lazy(() => import('./provider/pages/ClientCRMNotes'));
const CalendarSyncSettings = lazy(() => import('./provider/pages/CalendarSyncSettings'));
const InstantPayoutsDashboard = lazy(() => import('./provider/pages/InstantPayoutsDashboard'));
const FleetManagementPortal = lazy(() => import('./provider/pages/FleetManagementPortal'));

const AdminApprovals = lazy(() => import('./admin/pages/ProviderApprovals'));
const ArchitectureSpecPage = lazy(() => import('./admin/pages/ArchitectureSpecPage'));
const SystemHealthStatusPage = lazy(() => import('./admin/pages/SystemHealthStatusPage'));
const AnalyticsDashboard = lazy(() => import('./admin/pages/AnalyticsDashboard'));
const LegalPage = lazy(() => import('./customer/pages/LegalPage'));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-24 text-[var(--text-muted)]">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 antialiased bg-texture-grain">
        <Navbar />
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/customer/login' element={<CustomerLogin />} />
              <Route path='/customer/signup' element={<CustomerSignup />} />
              <Route path='/customer/orders' element={<ProtectedRoute><CustomerOrders /></ProtectedRoute>} />
              <Route path='/customer/provider/:id' element={<ProviderDetails />} />
              <Route path='/customer/book/:id' element={<ProtectedRoute><BookingFlow /></ProtectedRoute>} />
              <Route path='/customer/style-feed' element={<StyleInspirationFeed />} />
              <Route path='/customer/subscriptions' element={<ProtectedRoute><SubscriptionsManager /></ProtectedRoute>} />
              <Route path='/customer/addresses' element={<ProtectedRoute><AddressBookManager /></ProtectedRoute>} />
              <Route path='/customer/vouchers' element={<GiftVouchersPage />} />
              <Route path='/customer/rewards' element={<ReferralLoyaltyHub />} />

              <Route path='/legal' element={<LegalPage />} />
              <Route path='/terms' element={<LegalPage />} />
              <Route path='/privacy' element={<LegalPage />} />
              <Route path='/cancellation-policy' element={<LegalPage />} />

              <Route path='/provider/login' element={<ProviderLogin />} />
              <Route path='/provider/signup' element={<ProviderSignup />} />
              <Route path='/provider/coverage-zone' element={<ProtectedRoute requiredRole="provider"><CoverageZoneDrawer /></ProtectedRoute>} />
              <Route path='/provider/route-optimizer' element={<ProtectedRoute requiredRole="provider"><SmartRouteOptimizer /></ProtectedRoute>} />
              <Route path='/provider/client-crm' element={<ProtectedRoute requiredRole="provider"><ClientCRMNotes /></ProtectedRoute>} />
              <Route path='/provider/calendar-sync' element={<ProtectedRoute requiredRole="provider"><CalendarSyncSettings /></ProtectedRoute>} />
              <Route path='/provider/payouts' element={<ProtectedRoute requiredRole="provider"><InstantPayoutsDashboard /></ProtectedRoute>} />
              <Route path='/provider/fleet' element={<ProtectedRoute requiredRole="provider"><FleetManagementPortal /></ProtectedRoute>} />
              <Route path='/provider/*' element={<ProtectedRoute requiredRole="provider"><ProviderDashboard /></ProtectedRoute>} />

              <Route path='/admin/analytics' element={<ProtectedRoute requiredRole="admin"><AnalyticsDashboard /></ProtectedRoute>} />
              <Route path='/admin/*' element={<ProtectedRoute requiredRole="admin"><AdminApprovals /></ProtectedRoute>} />
              <Route path='/status' element={<ProtectedRoute requiredRole="admin"><SystemHealthStatusPage /></ProtectedRoute>} />
              <Route path='/docs/architecture' element={<ProtectedRoute requiredRole="admin"><ArchitectureSpecPage /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </main>
        <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] py-8 text-center text-xs text-[var(--text-muted)]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-[var(--text-primary)]">DropInn Marketplace</span> — At-Home Grooming & Barbering ("Accessible Premium Lifestyle")
            </div>
            <div className="flex items-center gap-4 text-[var(--text-secondary)] font-medium flex-wrap">
              <a href="/legal?doc=terms" className="hover:text-amber-500 text-[11px]">Terms of Service</a>
              <a href="/legal?doc=privacy" className="hover:text-amber-500 text-[11px]">Privacy Policy</a>
              <a href="/legal?doc=cancellation" className="hover:text-amber-500 text-[11px]">Cancellation Policy</a>
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
