import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { DollarSign, Activity, CreditCard, ShieldCheck, FileText, ArrowUpRight } from 'lucide-react';

export default function TransactionsMonitor() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'orders'))
      .then((snap) => setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false));
  }, []);

  // Calculate platform financial stats
  const totalVolume = orders.reduce((sum, o) => sum + (Number(o.price) || 100), 0);
  const totalCommission = orders.reduce((sum, o) => sum + (Number(o.commission) || 15), 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <span>Marketplace Financial Transactions</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time payment ledger, commission split & volume</p>
        </div>
        <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-slate-300 font-bold">
          {orders.length} {orders.length === 1 ? 'Transaction' : 'Transactions'}
        </span>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 font-medium">Gross Gross Volume</span>
          <span className="text-xl font-black text-amber-400 block">{totalVolume} ILS</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 font-medium">Platform Take Rate (15%)</span>
          <span className="text-xl font-black text-emerald-400 block">{totalCommission} ILS</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 font-medium">Total Processed Orders</span>
          <span className="text-xl font-black text-white block">{orders.length}</span>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading ledger logs...</div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
          <CreditCard className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No recorded transactions yet</p>
          <p className="text-xs text-slate-500">Bookings placed by customers will automatically appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">Order #{o.id.substring(0, 8)}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                    Paid
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Address: <strong className="text-slate-300">{o.address || 'Standard Location'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-sm font-extrabold text-white block">{o.price || 100} ILS</span>
                  <span className="text-[10px] text-slate-500 font-mono">Commission: {o.commission || 15} ILS</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
