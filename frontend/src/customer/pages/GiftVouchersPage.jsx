import React from 'react';
import { Gift, Sparkles } from 'lucide-react';

export default function GiftVouchersPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
          <Gift className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-white">Gift Vouchers - Coming Soon</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          We're building real gift vouchers with secure payment and redemption.
          This feature isn't available yet.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-slate-500 text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Check back soon</span>
        </div>
      </div>
    </div>
  );
}