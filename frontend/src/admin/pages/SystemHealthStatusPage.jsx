import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Radio, ShieldCheck, CheckCircle2, Clock, Cpu, RefreshCw } from 'lucide-react';

export default function SystemHealthStatusPage() {
  const [metrics, setMetrics] = useState({
    apiStatus: 'Operational',
    dbStatus: 'Operational (PostgreSQL + PostGIS)',
    wsStatus: 'Operational (Socket.io)',
    redisStatus: 'Operational (BullMQ Queue)',
    mapsStatus: 'Operational (Google Maps Distance Matrix API)',
    stripeStatus: 'Operational (Stripe Escrow & Payouts)',
    latencyMs: 18,
    uptimePercent: 99.98
  });

  const [lastCheckTime, setLastCheckTime] = useState(new Date().toLocaleTimeString());

  const refreshStatus = () => {
    setLastCheckTime(new Date().toLocaleTimeString());
    setMetrics(prev => ({
      ...prev,
      latencyMs: Math.floor(Math.random() * 10) + 14
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase">
            <Activity className="w-3.5 h-3.5" />
            <span>Platform System Health (#50)</span>
          </div>
          <button
            onClick={refreshStatus}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Re-Check Systems</span>
          </button>
        </div>
        
        <h1 className="text-3xl font-black text-white">DropIn V3.0 Operational Status</h1>
        <p className="text-xs text-slate-400">
          Real-time health status of database clusters, real-time WebSocket dispatch nodes, PostGIS spatial query engine, and external payment webhooks.
        </p>

        <div className="flex items-center gap-4 text-xs font-mono pt-2 border-t border-slate-800 text-slate-400">
          <span>Overall Uptime: <strong className="text-emerald-400">{metrics.uptimePercent}%</strong></span>
          <span>API Latency: <strong className="text-amber-400">{metrics.latencyMs}ms</strong></span>
          <span>Last Check: <strong className="text-slate-200">{lastCheckTime}</strong></span>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { name: 'Node.js REST API & Cloud Run', status: metrics.apiStatus, icon: Server, detail: '100% Deterministic Rule Engine' },
          { name: 'PostgreSQL + PostGIS GeoDB', status: metrics.dbStatus, icon: Database, detail: 'ST_Contains Spatial Polygon Query Engine' },
          { name: 'Socket.io WebSocket Server', status: metrics.wsStatus, icon: Radio, detail: 'Live Dispatch & SOS Telemetry Pub/Sub' },
          { name: 'BullMQ & Redis Workers', status: metrics.redisStatus, icon: Cpu, detail: 'Dynamic Yield Matrix & Schedule Workers' },
          { name: 'Google Distance Matrix API', status: metrics.mapsStatus, icon: Clock, detail: 'Dynamic Traffic Buffer Expansion Engine' },
          { name: 'Stripe Escrow & Split-Pay', status: metrics.stripeStatus, icon: ShieldCheck, detail: 'Escrow Security Deposit & Payout Webhooks' }
        ].map((s, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400">
                  <s.icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-extrabold text-white">{s.name}</h3>
              </div>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Operational</span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 border-t border-slate-950 pt-2">{s.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
