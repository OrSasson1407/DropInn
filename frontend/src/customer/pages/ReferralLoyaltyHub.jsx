import React, { useState } from 'react';
import { Award, Share2, Copy, CheckCircle2, Gift, Sparkles, Shield, UserPlus, Trophy } from 'lucide-react';
import { INITIAL_LOYALTY_TIERS } from '../../shared/services/v2Data';
import { useToast } from '../../shared/context/ToastContext';

export default function ReferralLoyaltyHub() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [points, setPoints] = useState(380);
  const referralCode = 'DROPIN-REF-4821';
  const referralUrl = `https://dropin.app/invite/${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success('Referral link copied to clipboard! Share with friends.', 'Link Copied');
    setTimeout(() => setCopied(false), 3000);
  };

  const currentTier = INITIAL_LOYALTY_TIERS[1]; // Gold VIP for 380 points

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase">
          <Award className="w-3.5 h-3.5" />
          <span>Growth & Rewards Program</span>
        </div>
        <h1 className="text-3xl font-black text-white">Referral & Loyalty VIP Club</h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Invite friends to DropIn and earned rewards on every booking. Your friends get <strong className="text-amber-400">50 ILS off</strong> their first haircut or manicure, and you earn <strong className="text-amber-400">50 ILS credit</strong>.
        </p>
      </div>

      {/* Referral Link Generator Box */}
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Share2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Your Personal Invite Link</h2>
            <p className="text-xs text-slate-400">Give 50 ILS, Get 50 ILS on completed bookings.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs font-mono text-amber-400 font-bold truncate">
            {referralUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className="py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 shrink-0"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Invite Link'}</span>
          </button>
        </div>
      </div>

      {/* Points Balance & Loyalty Tier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reward Points Balance</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{points}</span>
            <span className="text-xs text-amber-400 font-bold">Points ({points / 10} ILS Value)</span>
          </div>
          <p className="text-[11px] text-slate-500">Points auto-apply at checkout for instant discounts.</p>
        </div>

        <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 space-y-2 md:col-span-2 flex flex-col justify-between bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Current VIP Status</span>
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full">
              {currentTier.name}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-300 font-bold">Active Perks:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
              {currentTier.perks.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Loyalty Tiers Progression Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>Loyalty VIP Tiers</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_LOYALTY_TIERS.map((tier) => {
            const isCurrent = tier.id === currentTier.id;

            return (
              <div
                key={tier.id}
                className={`bg-slate-900 border rounded-3xl p-6 space-y-4 shadow-xl relative ${
                  isCurrent ? 'border-amber-500/80 ring-1 ring-amber-500/30' : 'border-slate-800'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-3 right-6 bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full">
                    YOU ARE HERE
                  </span>
                )}

                <div className="space-y-1">
                  <h3 className="font-black text-lg text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{tier.minPoints}+ Points Required</p>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
