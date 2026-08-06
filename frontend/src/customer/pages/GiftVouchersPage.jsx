import React, { useState } from 'react';
import { Gift, Sparkles, CheckCircle2, Copy, Send, Heart, Award, ShieldCheck } from 'lucide-react';
import { useToast } from '../../shared/context/ToastContext';

export default function GiftVouchersPage() {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState('');
  const [theme, setTheme] = useState('celebration');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [generatedVoucher, setGeneratedVoucher] = useState(null);
  const [redemptionCode, setRedemptionCode] = useState('');

  const themes = [
    { id: 'celebration', label: 'Celebration & Birthday', bg: 'from-amber-500 via-rose-500 to-purple-600' },
    { id: 'thankyou', label: 'Thank You', bg: 'from-emerald-500 via-teal-600 to-slate-900' },
    { id: 'grooming', label: 'Fresh Grooming VIP', bg: 'from-amber-600 via-amber-400 to-slate-950' },
    { id: 'holiday', label: 'Holiday & Gift', bg: 'from-indigo-600 via-purple-600 to-rose-600' }
  ];

  const handlePurchaseVoucher = (e) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!finalAmount || finalAmount < 50) {
      toast.warning('Minimum gift voucher amount is 50 ILS', 'Invalid Amount');
      return;
    }

    const code = `DROPIN-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${finalAmount}`;

    const voucherObj = {
      code,
      amount: finalAmount,
      recipientName: recipientName || 'Friend',
      recipientEmail: recipientEmail || 'friend@example.com',
      note: personalNote,
      theme,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setGeneratedVoucher(voucherObj);
    toast.success(
      `Digital Gift Voucher worth ${finalAmount} ILS generated! Code: ${code}`,
      'Gift Card Purchased'
    );
  };

  const handleRedeemCode = (e) => {
    e.preventDefault();
    if (!redemptionCode.trim()) return;

    if (redemptionCode.toUpperCase().includes('DROPIN')) {
      toast.success(
        `Voucher ${redemptionCode.toUpperCase()} redeemed! Added 150 ILS credit to your wallet balance.`,
        'Voucher Redeemed'
      );
      setRedemptionCode('');
    } else {
      toast.error('Invalid or expired voucher code', 'Redemption Failed');
    }
  };

  const activeThemeObj = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase">
          <Gift className="w-3.5 h-3.5" />
          <span>E-Gifting & Digital Vouchers</span>
        </div>
        <h1 className="text-3xl font-black text-white">Give The Gift of At-Home Grooming</h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Send instant digital gift cards for haircuts, manicures, blowouts, and massages. Delivered directly to your recipient's email or phone with custom cards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <span>Customize Digital Gift Voucher</span>
          </h2>

          <form onSubmit={handlePurchaseVoucher} className="space-y-4 text-xs">
            {/* Amount Buttons */}
            <div>
              <label className="block font-bold text-slate-300 mb-2">Select Voucher Value (ILS)</label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 200, 300, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                    className={`py-2.5 rounded-xl font-black border transition-all ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {amt} ILS
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Or Enter Custom Amount (ILS)</label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="e.g. 250..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Theme Selection */}
            <div>
              <label className="block font-bold text-slate-300 mb-2">Gift Card Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all ${
                      theme === t.id
                        ? 'bg-slate-800 text-white border-amber-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Details */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Friend or family member name..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Recipient Email</label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@example.com..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Personal Message</label>
                <textarea
                  rows={2}
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="Happy Birthday! Enjoy a fresh haircut on me..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4" />
              <span>Purchase Gift Card ({customAmount || selectedAmount} ILS)</span>
            </button>
          </form>
        </div>

        {/* Right Preview Card & Redeem Section */}
        <div className="space-y-6">
          {/* Live Card Preview */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Live Gift Card Visual Preview
            </span>

            <div
              className={`p-6 rounded-3xl bg-gradient-to-tr ${activeThemeObj.bg} text-white shadow-2xl space-y-6 relative overflow-hidden min-h-[220px] flex flex-col justify-between border border-white/20`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-lg tracking-tight">DropIn E-Gift</span>
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>

              <div>
                <p className="text-xs font-semibold text-white/80">Gifted to: {recipientName || 'Recipient Name'}</p>
                <p className="text-2xl font-black text-amber-200 mt-1">
                  {customAmount || selectedAmount} ILS
                </p>
                {personalNote && (
                  <p className="text-xs italic text-white/90 mt-2 bg-black/20 p-2 rounded-xl backdrop-blur">
                    "{personalNote}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white/70 pt-2 border-t border-white/20">
                <span>Valid for All At-Home Services</span>
                <span>CODE: DROPIN-GIFT-XXXX</span>
              </div>
            </div>
          </div>

          {/* Code Redeem Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h3 className="font-extrabold text-sm text-white">Have a Voucher Code? Redeem Here</h3>
            <form onSubmit={handleRedeemCode} className="flex gap-2">
              <input
                type="text"
                value={redemptionCode}
                onChange={(e) => setRedemptionCode(e.target.value)}
                placeholder="Enter DROPIN-XXXX..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
              >
                Redeem
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
