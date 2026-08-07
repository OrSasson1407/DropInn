import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, FileText, Lock, AlertTriangle, Scale } from 'lucide-react';
import PageHeaderBar from '../../shared/components/PageHeaderBar';

export default function LegalPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('doc') || 'terms';
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <PageHeaderBar
        title="Legal & Compliance Policies"
        subtitle="Platform Terms of Service, Privacy Protection & At-Home Service Cancellation Policy"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Legal Policies' }
        ]}
      />

      {/* Warning Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 text-amber-400">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <p className="text-xs font-bold uppercase tracking-wider">
          DRAFT — REQUIRES LEGAL REVIEW BEFORE COMMERCIAL LAUNCH IN PRODUCTION
        </p>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('terms')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'terms'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Terms of Service</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'privacy'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Privacy Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('cancellation')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'cancellation'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Cancellation & Refunds</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-300 text-xs leading-relaxed shadow-2xl">
        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <span>Terms of Service Agreement</span>
            </h2>
            <p>
              Welcome to DropIn. By accessing or using our at-home beauty, grooming, and personal care marketplace app, you agree to be bound by these Terms of Service.
            </p>
            <h3 className="font-bold text-white text-sm">1. Independent Service Providers</h3>
            <p>
              DropIn connects customers with verified independent beauty and grooming professionals. Providers are independent contractors and not employees or agents of DropIn.
            </p>
            <h3 className="font-bold text-white text-sm">2. Booking & At-Home Access</h3>
            <p>
              Customers are responsible for providing a safe, accessible, and clean environment for the requested at-home service visit.
            </p>
            <h3 className="font-bold text-white text-sm">3. Platform Fees & Commission</h3>
            <p>
              DropIn charges a standard platform commission (15%) on completed bookings to maintain secure dispatch, verification, and customer support.
            </p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>Privacy & Data Protection Policy</span>
            </h2>
            <p>
              At DropIn, we take your privacy and personal data security seriously. This policy outlines how location data, contact details, and payment information are collected and protected.
            </p>
            <h3 className="font-bold text-white text-sm">1. Location Data Usage</h3>
            <p>
              Your home address and GPS coordinates are used strictly to facilitate provider routing and arrival time estimation for active bookings. Your exact address is never published publicly.
            </p>
            <h3 className="font-bold text-white text-sm">2. Payment Security</h3>
            <p>
              All payment card processing is conducted via encrypted Stripe PCI-DSS compliant infrastructure. DropIn never stores raw credit card numbers on its servers.
            </p>
          </div>
        )}

        {activeTab === 'cancellation' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Cancellation & Refund Policy</span>
            </h2>
            <p>
              To protect the travel time and schedule commitments of our independent mobile providers, DropIn enforces a clear and fair cancellation policy.
            </p>
            <h3 className="font-bold text-white text-sm">1. Free Cancellation Window</h3>
            <p>
              Bookings can be cancelled free of charge up to 30 minutes before the provider dispatches to your location.
            </p>
            <h3 className="font-bold text-white text-sm">2. Late Cancellation Fee</h3>
            <p>
              Cancellations made within 30 minutes of provider arrival or after provider dispatch incur a flat 25 ILS late fee to compensate provider travel expenses.
            </p>
            <h3 className="font-bold text-white text-sm">3. Automated Refunds</h3>
            <p>
              If a provider cancels an order or fails to arrive, the customer is automatically issued a 100% full refund to their original payment method.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
