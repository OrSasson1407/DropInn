import React, { useState, useEffect } from 'react';
import { DollarSign, Wallet, TrendingUp, ShieldCheck, Zap, ExternalLink } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../shared/context/AuthContext';
import { useToast } from '../../shared/context/ToastContext';

export default function InstantPayoutsDashboard() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'orders'), where('providerId', '==', currentUser.uid));
    getDocs(q)
      .then((snap) => {
        const orders = snap.docs.map((d) => d.data());
        const completed = orders.filter((o) => o.status === 'completed' || o.status === 'approved');
        const total = completed.reduce((sum, o) => sum + (Number(o.providerPayout) || 0), 0);
        setBalance(total);
        setCompletedCount(completed.length);
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  const handlePayoutInfo = () => {
    toast.info(
      'Instant bank payouts require Stripe Connect to be set up for your account. This is not configured yet.',
      'Payouts Not Available Yet'
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-amber-400">
          <Wallet className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-wider">Earnings</span>
        </div>
        <h1 className="text-2xl font-black text-white">Your Balance</h1>
        <p className="text-xs text-slate-400">
          Real balance calculated from your completed order payouts (price minus platform commission).
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Available Balance</p>
            <p className="text-3xl font-black text-white">
              {loading ? '...' : `${balance.toLocaleString()} ILS`}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{loading ? 'Loading...' : `From ${completedCount} completed order(s)`}</span>
        </p>

        <button
          onClick={handlePayoutInfo}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <Zap className="w-4 h-4" />
          <span>Instant Payout - Requires Stripe Connect Setup</span>
        </button>
      </div>

      
        href="https://dashboard.stripe.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition-all"
      >
        <div className="flex items-center gap-2.5 text-slate-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>View real payment/payout records on Stripe Dashboard</span>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
      </a>
    </div>
  );
}