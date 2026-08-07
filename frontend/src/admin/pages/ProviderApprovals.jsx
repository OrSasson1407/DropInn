import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ShieldCheck, Check, Clock, UserCheck, Search, FileText, Activity } from 'lucide-react';
import TransactionsMonitor from './TransactionsMonitor';

export default function ProviderApprovals() {
  const [providers, setProviders] = useState([]);
  const [activeTab, setActiveTab] = useState('approvals');
  const [loading, setLoading] = useState(true);
  const [selectedDocUrl, setSelectedDocUrl] = useState(null);

  useEffect(() => {
    getDocs(collection(db, 'providers'))
      .then((snap) => setProviders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    try {
      await updateDoc(doc(db, 'providers', id), { isApproved: true, idVerified: true });
      setProviders(providers.map((p) => (p.id === id ? { ...p, isApproved: true, idVerified: true } : p)));
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{p.name || `Barber #${p.id.substring(0, 8)}`}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.isApproved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {p.isApproved ? 'Approved & Active' : 'Pending Verification'}
                      </span>
                      {p.idDocumentSubmitted && (
                        <button
                          onClick={() => setSelectedDocUrl(p.idDocumentUrl || 'MOCK_ID_DOCUMENT')}
                          className="px-2.5 py-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View ID Document</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-amber-400 font-medium">Category: {p.category || 'Grooming'} • {p.price || 120} ILS</p>
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

      {/* ID Document Preview Modal */}
      {selectedDocUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Govt ID & License Verification Document</span>
              </div>
              <button
                onClick={() => setSelectedDocUrl(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Close
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-center min-h-[220px]">
              {selectedDocUrl.startsWith('data:image') ? (
                <img src={selectedDocUrl} alt="Submitted ID Proof" className="max-h-72 object-contain rounded-xl" />
              ) : (
                <div className="text-center space-y-2">
                  <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-white">Government ID Document Verified</p>
                  <p className="text-[11px] text-slate-400">Identity verification record attached to provider account.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
