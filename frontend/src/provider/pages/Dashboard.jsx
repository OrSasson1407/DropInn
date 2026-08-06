import React from 'react';
import AvailabilityToggle from './AvailabilityToggle';
import IncomingOrders from './IncomingOrders';
import { Scissors, DollarSign, TrendingUp, Star, ShieldCheck, Sparkles, Clock } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Scissors className="w-3.5 h-3.5" />
              <span>Barber Command Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Barber Workspace</h1>
            <p className="text-xs text-slate-400">Manage online status, accept incoming haircut requests & track revenue</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">Verified Pro Barber</span>
            </div>
          </div>
        </div>

        {/* Quick Barber Performance Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Today's Revenue</span>
            </span>
            <span className="text-xl font-black text-amber-400 block">400 ILS</span>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-blue-400" />
              <span>Jobs Completed</span>
            </span>
            <span className="text-xl font-black text-white block">4 Haircuts</span>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Customer Rating</span>
            </span>
            <span className="text-xl font-black text-white block">4.9 / 5.0</span>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Avg. Response</span>
            </span>
            <span className="text-xl font-black text-emerald-400 block">&lt; 1 min</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Toggle + Incoming Orders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <AvailabilityToggle />
        </div>
        <div className="md:col-span-2">
          <IncomingOrders />
        </div>
      </div>
    </div>
  );
}
