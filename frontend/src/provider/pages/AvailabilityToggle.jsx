import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { setProviderAvailability } from '../../shared/services/firestore';
import { useAuth } from '../../shared/context/AuthContext';
import { useToast } from '../../shared/context/ToastContext';
import { Radio, Power, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function AvailabilityToggle() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setLoadingStatus(false);
      return;
    }
    getDoc(doc(db, 'providers', currentUser.uid))
      .then((snap) => {
        setIsAvailable(Boolean(snap.data()?.isAvailable));
      })
      .catch((e) => console.error('Failed to load availability status:', e))
      .finally(() => setLoadingStatus(false));
  }, [currentUser]);

  const toggle = async () => {
    const newVal = !isAvailable;
    setLoading(true);
    setIsAvailable(newVal);
    if (currentUser) {
      try {
        await setProviderAvailability(currentUser.uid, newVal);
        if (newVal) {
          toast.success('You are now ONLINE and visible to nearby clients for instant booking!', 'Dispatch Mode Active');
        } else {
          toast.info('You are now OFFLINE. You will not receive new incoming booking requests.', 'Dispatch Mode Inactive');
        }
      } catch (e) {
        console.error(e);
        setIsAvailable(!newVal);
        toast.error('Failed to update availability status', 'Network Error');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-3xl border p-6 transition-all shadow-xl space-y-6 ${
      isAvailable 
        ? 'bg-slate-900 border-emerald-500/40 shadow-emerald-500/5' 
        : 'bg-slate-900/80 border-slate-800'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
            isAvailable ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
          }`}>
            <Power className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dispatch Mode</span>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{loadingStatus ? 'Loading...' : (isAvailable ? 'Online & Available' : 'Offline')}</span>
              {isAvailable && !loadingStatus && <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />}
            </h3>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        {isAvailable 
          ? 'You are currently broadcasting your availability. Customers nearby can see your profile and send haircut orders.' 
          : 'Turn Online when you are equipped with your tools and ready to receive customer haircut bookings.'}
      </p>

      <button
        onClick={toggle}
        disabled={loading || loadingStatus}
        className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-95 ${
          isAvailable
            ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30'
            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-500/20'
        }`}
      >
        <Radio className={`w-4 h-4 stroke-[2.5] ${isAvailable ? 'text-rose-400' : 'text-slate-950 animate-pulse'}`} />
        <span>{isAvailable ? 'Go Offline' : 'Go Online Now'}</span>
      </button>
    </div>
  );
}