import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createOrder } from '../../shared/services/firestore';
import { useAuth } from '../../shared/context/AuthContext';
import { processPayment } from '../../shared/services/payments';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { MapPin, CreditCard, ShieldCheck, Clock, Star, CheckCircle, ArrowRight, Loader2, Sparkles, Navigation, Scissors } from 'lucide-react';

export default function BookingFlow() {
  const { id: providerId } = useParams();
  const { currentUser } = useAuth();
  const nav = useNavigate();
  const [address, setAddress] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [status, setStatus] = useState('');
  const [ratingVal, setRatingVal] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    return onSnapshot(doc(db, 'orders', orderId), (docSnap) => {
      if (docSnap.exists()) setStatus(docSnap.data().status);
    });
  }, [orderId]);

  const handleBook = async (e) => {
    if (e) e.preventDefault();
    if (!currentUser) return nav('/customer/login');
    if (!address.trim()) return alert('Please enter your delivery address');

    setIsSubmitting(true);
    try {
      await processPayment(100, providerId);
      const ref = await createOrder(currentUser.uid, providerId, { address, price: 100 });
      setOrderId(ref.id);
    } catch (err) {
      alert(err.message || 'Payment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status Track View once order is created
  if (orderId) {
    const isApproved = status === 'approved';
    const isCompleted = status === 'completed';

    return (
      <div className="max-w-2xl mx-auto space-y-8 py-4">
        {/* Order Status Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">Order ID #{orderId.substring(0, 8)}</span>
              <h2 className="text-2xl font-black text-white mt-1">Grooming Dispatch</h2>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isCompleted 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : isApproved 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
            }`}>
              {!isCompleted && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{status || 'pending'}</span>
            </div>
          </div>

          {/* Stepper tracker */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center mx-auto">
                <CheckCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-slate-300">Order Placed</span>
            </div>
            <div className="space-y-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold transition-all ${
                isApproved || isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                {isApproved || isCompleted ? <CheckCircle className="w-5 h-5 stroke-[2.5]" /> : '2'}
              </div>
              <span className={isApproved || isCompleted ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                Barber On The Way
              </span>
            </div>
            <div className="space-y-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold transition-all ${
                isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                {isCompleted ? <CheckCircle className="w-5 h-5 stroke-[2.5]" /> : '3'}
              </div>
              <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                Completed
              </span>
            </div>
          </div>

          {/* Map Simulation Box */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4 text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-3 text-slate-400 text-xs">
              <Navigation className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Location: <strong className="text-white">{address}</strong></span>
            </div>
            
            <div className="h-36 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center shadow-lg shadow-amber-500/20 animate-bounce">
                  <Scissors className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold text-slate-200">
                  {isCompleted ? 'Haircut Delivered!' : isApproved ? 'Barber is driving to your address...' : 'Waiting for barber to accept request...'}
                </span>
              </div>
            </div>
          </div>

          {/* Review Step on Completion */}
          {status === 'completed' && (
            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-6 space-y-4 text-center">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Haircut Completed!</h3>
                <p className="text-xs text-slate-400">How was your grooming experience?</p>
              </div>

              {/* Star selection */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRatingVal(s)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-8 h-8 ${s <= ratingVal ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                  </button>
                ))}
              </div>

              <button
                onClick={() => nav('/')}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Submit & Return Home</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="space-y-2 border-b border-slate-800 pb-5">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Instant Mobile Dispatch</span>
          </span>
          <h2 className="text-2xl font-black text-white">Book Your Haircut</h2>
          <p className="text-xs text-slate-400">Enter your address for instant barber arrival</p>
        </div>

        <form onSubmit={handleBook} className="space-y-6">
          {/* Address Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Delivery Address / Hotel / Office
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-amber-400" />
              <input
                type="text"
                placeholder="e.g. Rothschild Blvd 45, Tel Aviv"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            {/* Quick Address Chips */}
            <div className="flex gap-2 pt-1">
              {['Home Address', 'Current Location', 'Office'].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setAddress(label + ' - Main Entrance')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                >
                  + {label}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing summary */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Grooming Service (Haircut + Styling)</span>
              <span className="font-semibold text-white">100 ILS</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>On-Demand Express Delivery</span>
              <span className="text-emerald-400 font-bold">FREE</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-white">
              <span>Total Price</span>
              <span className="text-amber-400 font-extrabold text-base">100 ILS</span>
            </div>
          </div>

          {/* Guarantee */}
          <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <CreditCard className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Secure simulated payment. Charged only when barber accepts order.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <span>Pay 100 ILS & Request Barber</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
