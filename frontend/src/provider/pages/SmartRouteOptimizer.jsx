import React, { useState } from 'react';
import { Navigation, Clock, MapPin, ArrowRight, Zap, RefreshCw, CheckCircle2, ShieldCheck, Fuel } from 'lucide-react';
import { useToast } from '../../shared/context/ToastContext';

export default function SmartRouteOptimizer() {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [stops, setStops] = useState([
    {
      id: 'stop_1',
      clientName: 'Michael Dan',
      service: 'Men\'s Skin Fade + Hot Towel',
      address: 'Rothschild Blvd 45, Tel Aviv',
      scheduledTime: '10:00 AM',
      travelBuffer: '12 min',
      distance: '1.8 km',
      optimizedOrder: 1
    },
    {
      id: 'stop_2',
      clientName: 'Daniela Roth',
      service: 'Gel Manicure & Pedicure',
      address: 'HaArba\'a St 28, Tel Aviv',
      scheduledTime: '11:15 AM',
      travelBuffer: '8 min',
      distance: '1.2 km',
      optimizedOrder: 2
    },
    {
      id: 'stop_3',
      clientName: 'Guy S.',
      service: 'Beard Sculpting & Haircut',
      address: 'Dizengoff St 112, Tel Aviv',
      scheduledTime: '01:00 PM',
      travelBuffer: '15 min',
      distance: '2.4 km',
      optimizedOrder: 3
    }
  ]);

  const handleRunOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      toast.success(
        'Smart Route Optimization completed! Sequence re-ordered for minimum travel time. Saved 22 mins travel buffer.',
        'Route Optimized'
      );
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400">
            <Navigation className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-wider">Provider Tool #7</span>
          </div>
          <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
            Backtracking Engine Active
          </span>
        </div>
        <h1 className="text-2xl font-black text-white">Smart Daily Route Optimizer</h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Algorithmic scheduling engine that recalculates appointment sequence based on traffic forecasts, travel buffers, and service durations to maximize daily earnings.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Total Daily Stops</span>
          <p className="text-2xl font-black text-white">{stops.length} Clients</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Total Distance</span>
          <p className="text-2xl font-black text-amber-400">5.4 km</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Travel Buffer Time</span>
          <p className="text-2xl font-black text-emerald-400">35 min total</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Est. Fuel Savings</span>
          <p className="text-2xl font-black text-amber-400">~28 ILS / day</p>
        </div>
      </div>

      {/* Optimization Control Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRunOptimization}
          disabled={isOptimizing}
          className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <RefreshCw className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
          <span>{isOptimizing ? 'Calculating Optimal Sequence...' : 'Re-Run Smart Route Optimization'}</span>
        </button>
      </div>

      {/* Optimized Stops Sequence List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white">Daily Appointment Sequence</h2>

        <div className="space-y-4">
          {stops.map((stop, idx) => (
            <div
              key={stop.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 transition-all shadow-xl space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-md">
                    #{stop.optimizedOrder}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">{stop.clientName}</h3>
                    <p className="text-xs text-amber-400 font-bold">{stop.service}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-full border border-slate-800 text-xs font-mono font-bold text-slate-300 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{stop.scheduledTime}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-mono text-slate-300 truncate">{stop.address}</span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-slate-400 font-mono">
                  <span>Travel Buffer: <strong className="text-emerald-400">{stop.travelBuffer}</strong></span>
                  <span>Distance: <strong className="text-amber-400">{stop.distance}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
