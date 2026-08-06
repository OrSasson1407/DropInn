import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AvailabilityToggle from './AvailabilityToggle';
import IncomingOrders from './IncomingOrders';
import BarberProfileEditor from './BarberProfileEditor';
import { 
  Scissors, DollarSign, TrendingUp, Star, ShieldCheck, Sparkles, 
  Clock, UserCheck, Bell, Image as ImageIcon, Briefcase, Calendar,
  MapPin, Navigation, Wallet, Settings
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dispatch'); // 'dispatch' | 'profile'

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span>Provider Command Console v2.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Provider Workspace</h1>
            <p className="text-xs text-slate-400">Manage online dispatch availability, incoming client orders & customize your service menu</p>
          </div>

          {/* Navigation Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'dispatch'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Live Orders & Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Profile & Portfolio Gallery</span>
            </button>
          </div>
        </div>

        {/* Quick V2 Tools Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <Link
            to="/provider/coverage-zone"
            className="p-3 bg-slate-950/80 hover:bg-slate-800 rounded-2xl border border-slate-800 text-slate-300 hover:text-amber-400 font-bold transition-all flex flex-col items-center gap-1 text-center"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Coverage Zone</span>
          </Link>

          <Link
            to="/provider/route-optimizer"
            className="p-3 bg-slate-950/80 hover:bg-slate-800 rounded-2xl border border-slate-800 text-slate-300 hover:text-amber-400 font-bold transition-all flex flex-col items-center gap-1 text-center"
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>Route Optimizer</span>
          </Link>

          <Link
            to="/provider/client-crm"
            className="p-3 bg-slate-950/80 hover:bg-slate-800 rounded-2xl border border-slate-800 text-slate-300 hover:text-amber-400 font-bold transition-all flex flex-col items-center gap-1 text-center"
          >
            <Scissors className="w-4 h-4 text-amber-400" />
            <span>Client Guard CRM</span>
          </Link>

          <Link
            to="/provider/calendar-sync"
            className="p-3 bg-slate-950/80 hover:bg-slate-800 rounded-2xl border border-slate-800 text-slate-300 hover:text-amber-400 font-bold transition-all flex flex-col items-center gap-1 text-center"
          >
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Calendar Sync</span>
          </Link>

          <Link
            to="/provider/payouts"
            className="p-3 bg-slate-950/80 hover:bg-slate-800 rounded-2xl border border-slate-800 text-slate-300 hover:text-amber-400 font-bold transition-all flex flex-col items-center gap-1 text-center"
          >
            <Wallet className="w-4 h-4 text-amber-400" />
            <span>Instant Payouts</span>
          </Link>
        </div>

        {/* Quick Performance Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Today's Net Revenue</span>
            </span>
            <span className="text-xl font-black text-amber-400 block">480 ILS</span>
            <span className="text-[10px] text-slate-500 font-mono">(After 15% platform commission)</span>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Completed Visits</span>
            </span>
            <span className="text-xl font-black text-white block">5 Appointments</span>
            <span className="text-[10px] text-emerald-400 font-semibold">100% On-Time</span>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Customer Rating</span>
            </span>
            <span className="text-xl font-black text-white block">4.95 / 5.0</span>
            <span className="text-[10px] text-slate-500 font-mono">(52 verified reviews)</span>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Average Arrival ETA</span>
            </span>
            <span className="text-xl font-black text-emerald-400 block">18 Mins</span>
            <span className="text-[10px] text-slate-500 font-mono">Mobile studio delivery</span>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dispatch' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <AvailabilityToggle />
          </div>
          <div className="md:col-span-2">
            <IncomingOrders />
          </div>
        </div>
      ) : (
        <BarberProfileEditor />
      )}
    </div>
  );
}
