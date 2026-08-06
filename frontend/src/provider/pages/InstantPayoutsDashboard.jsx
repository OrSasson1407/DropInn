import React, { useState } from 'react';
import { DollarSign, Wallet, ArrowDownRight, TrendingUp, Download, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '../../shared/context/ToastContext';

export default function InstantPayoutsDashboard() {
  const { toast } = useToast();
  const [balance, setBalance] = useState(1840);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState([
    { id: 'pay_1', amount: 1250, date: '2026-08-01', status: 'completed', destination: 'Leumi Bank ****4821' },
    { id: 'pay_2', amount: 980, date: '2026-07-24', status: 'completed', destination: 'Visa Direct ****9012' }
  ]);

  const handleTriggerInstantPayout = () => {
    if (balance <= 0) {
      toast.warning('No available balance for instant payout', 'Zero Balance');
      return;
    }

    setIsProcessingPayout(true);
    setTimeout(() => {
      const payoutAmount = balance;
      setBalance(0);
      setPayoutHistory((prev) => [
        {
          id: `pay_${Date.now()}`,
          amount: payoutAmount,
          date: new Date().toISOString().split('T')[0],
          status: 'completed',
          destination: 'Instant Transfer to Bank Account ****4821'
        },
        ...prev
      ]);
      setIsProcessingPayout(false);
      toast.success(
        `Instant payout of ${payoutAmount} ILS processed! Funds transferred to your linked bank account.`,
        'Payout Complete'
      );
    }, 1200);
  };

  const handleDownloadTaxStatement = () => {
    toast.success('Downloading July 2026 Tax Statement (PDF format)...', 'Tax Document Exported');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400">
            <Wallet className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-wider">Provider Tool #11</span>
          </div>
          <span className="text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
            15% Standard Commission
          </span>
        </div>
        <h1 className="text-2xl font-black text-white">Instant Payouts & Financial Analytics</h1>
        <p className="text-xs text-slate-400">
          Track completed appointment earnings, client tip payouts, platform fees, and trigger instant 24/7 payouts directly to your bank account.
        </p>
      </div>

      {/* Available Balance Box */}
      <div className="bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider">Available Payout Balance</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white">{balance}</span>
            <span className="text-lg font-bold text-amber-400">ILS</span>
          </div>
          <p className="text-[11px] text-slate-400">Includes 240 ILS client tips (100% passed to provider).</p>
        </div>

        <button
          onClick={handleTriggerInstantPayout}
          disabled={isProcessingPayout || balance <= 0}
          className={`py-3.5 px-6 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-xl shrink-0 ${
            balance > 0
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Zap className={`w-4 h-4 ${isProcessingPayout ? 'animate-bounce' : ''}`} />
          <span>{isProcessingPayout ? 'Processing Bank Transfer...' : 'Trigger Instant Payout Now'}</span>
        </button>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase">This Month Gross</span>
          <p className="text-xl font-black text-white">4,850 ILS</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Tips Earned (100%)</span>
          <p className="text-xl font-black text-emerald-400">540 ILS</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase">DropIn Platform Fee (15%)</span>
          <p className="text-xl font-black text-rose-400">-645 ILS</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Completed Bookings</span>
          <p className="text-xl font-black text-amber-400">38 Sessions</p>
        </div>
      </div>

      {/* Payout History & Tax Statement Export */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">Payout History</h2>
          <button
            onClick={handleDownloadTaxStatement}
            className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download Monthly Tax Summary (PDF)</span>
          </button>
        </div>

        <div className="space-y-2">
          {payoutHistory.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 font-bold">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-sm">{item.amount} ILS Transferred</p>
                  <p className="text-slate-400 text-[11px] font-mono">{item.destination}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-slate-400 block">{item.date}</span>
                <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
