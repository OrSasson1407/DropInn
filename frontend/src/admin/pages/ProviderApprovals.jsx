import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ShieldCheck, Check, Clock, UserCheck, Search, FileText, Activity } from 'lucide-react';
import TransactionsMonitor from './TransactionsMonitor';

export default function ProviderApprovals() {
  const [providers, setProviders] = useState([]);
  const [activeTab, setActiveTab] = useState('approvals');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'providers'))
      .then((snap) => setProviders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    try {
      await updateDoc(doc(db, 'providers', id), { isApproved: true });
      setProviders(providers.map((p) => (p.id === id ? { ...p, isApproved: true } : p)));
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Admin Console Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DropIn Platform Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Command Portal</h1>
            <p className="text-xs text-slate-400">Review barber verification applications & audit overall marketplace transactions</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'approvals'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Provider Approvals</span>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'transactions'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Transaction Monitor</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'transactions' ? (
        <TransactionsMonitor />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-xl font-bold text-white">Barber Partner Applications</h2>
              <p className="text-xs text-slate-400 mt-0.5">Approve or audit registered provider profiles</p>
            </div>
            <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-slate-300 font-bold">
              {providers.length} Applicants
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading provider records...</div>
          ) : providers.length === 0 ? (
            <div className="py-12 text-center bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
              <UserCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No providers submitted for approval</p>
              <p className="text-xs text-slate-500">When new barbers sign up, they will appear here for verification.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{p.name || `Barber #${p.id.substring(0, 8)}`}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.isApproved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {p.isApproved ? 'Approved' : 'Pending Verification'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-500">UID: {p.id}</p>
                  </div>

                  {!p.isApproved ? (
                    <button
                      onClick={() => approve(p.id)}
                      className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Approve Provider</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Verified & Active</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
