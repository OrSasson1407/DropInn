import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, ShieldCheck, Zap, Sparkles, Calendar, ArrowRight, Play, Pause } from 'lucide-react';
import { useToast } from '../../shared/context/ToastContext';

export default function SubscriptionsManager() {
  const { toast } = useToast();
  const [activeSubscription, setActiveSubscription] = useState(() => {
    const saved = localStorage.getItem('dropin_subscription');
    return saved ? JSON.parse(saved) : null;
  });

  const subscriptionPlans = [
    {
      id: 'plan_biweekly',
      name: 'Bi-Weekly Fresh Fade Pass',
      price: 180,
      frequency: 'Every 2 Weeks (2 Sessions/mo)',
      savings: 'Save 20% vs single bookings',
      features: [
        '2 At-Home Haircuts per month',
        'Hot Towel Razor Lineup included',
        'Free Travel Fee on all visits',
        'Priority Dispatch slot reservation'
      ]
    },
    {
      id: 'plan_monthly_vip',
      name: 'Monthly Grooming & Beard VIP',
      price: 320,
      frequency: 'Every 4 Weeks (2 Haircuts + Beard)',
      savings: 'Save 25% + Free Scalp Detox',
      popular: true,
      features: [
        '2 Full Haircuts + Beard Sculpting',
        'Complimentary Scalp Detox Treatment',
        'Zero Travel Surge Fees',
        'Dedicated Preferred Specialist'
      ]
    }
  ];

  const handleSubscribe = (plan) => {
    const subObj = {
      id: `sub_${Date.now()}`,
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      frequency: plan.frequency,
      status: 'active',
      nextDeliveryDate: '2026-08-20',
      createdDate: new Date().toISOString().split('T')[0]
    };

    setActiveSubscription(subObj);
    localStorage.setItem('dropin_subscription', JSON.stringify(subObj));
    toast.success(
      `Subscribed to ${plan.name} (${plan.price} ILS/mo)! Your bi-weekly slot is reserved.`,
      'Subscription Activated'
    );
  };

  const togglePauseSubscription = () => {
    if (!activeSubscription) return;
    const newStatus = activeSubscription.status === 'active' ? 'paused' : 'active';
    const updated = { ...activeSubscription, status: newStatus };
    setActiveSubscription(updated);
    localStorage.setItem('dropin_subscription', JSON.stringify(updated));

    if (newStatus === 'paused') {
      toast.info('Subscription paused. Auto-renewal and dispatch on hold.', 'Subscription Paused');
    } else {
      toast.success('Subscription resumed! Regular grooming schedule re-activated.', 'Subscription Active');
    }
  };

  const handleCancelSubscription = () => {
    setActiveSubscription(null);
    localStorage.removeItem('dropin_subscription');
    toast.info('Subscription cancelled.', 'Subscription Removed');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Automated Care Subscriptions</span>
        </div>
        <h1 className="text-3xl font-black text-white">Recurring Grooming Membership</h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Never worry about booking last-minute. Enjoy automated bi-weekly or monthly barber & beauty deliveries with <strong className="text-amber-400">up to 25% savings</strong> and zero travel surge fees.
        </p>
      </div>

      {/* Active Subscription Status Banner */}
      {activeSubscription && (
        <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                Active Membership
              </span>
              <h2 className="text-xl font-black text-white mt-1">{activeSubscription.planName}</h2>
              <p className="text-xs text-slate-400 font-mono">
                {activeSubscription.price} ILS / month • {activeSubscription.frequency}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={togglePauseSubscription}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5"
              >
                {activeSubscription.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4 text-amber-400" />
                    <span>Pause Membership</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-emerald-400" />
                    <span>Resume Membership</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCancelSubscription}
                className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">Status</span>
              <span className={`font-black uppercase ${
                activeSubscription.status === 'active' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {activeSubscription.status}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Next Scheduled Visit</span>
              <span className="text-white font-mono font-bold">{activeSubscription.nextDeliveryDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Travel Surge Fee</span>
              <span className="text-emerald-400 font-bold">Waived (0 ILS)</span>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-white">Available Subscription Plans</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscriptionPlans.map((plan) => {
            const isSelected = activeSubscription?.planId === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative bg-slate-900 border rounded-3xl p-6 space-y-5 transition-all shadow-xl flex flex-col justify-between ${
                  plan.popular
                    ? 'border-amber-500/80 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 ring-1 ring-amber-500/30'
                    : 'border-slate-800'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-6 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-white">{plan.name}</h3>
                    <p className="text-xs text-amber-400 font-bold mt-0.5">{plan.savings}</p>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-white">{plan.price}</span>
                    <span className="text-sm font-bold text-slate-400">ILS / month</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isSelected}
                  className={`w-full py-3 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Current Active Plan</span>
                    </>
                  ) : (
                    <>
                      <span>Select Membership</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
