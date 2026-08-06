import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../shared/context/AuthContext';
import { useToast } from '../../shared/context/ToastContext';
import { Bell, MapPin, Check, X, Scissors, Clock, DollarSign, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function IncomingOrders() {
  const [orders, setOrders] = useState([]);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'orders'), where('providerId', '==', currentUser.uid));
    return onSnapshot(q, (snap) => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [currentUser]);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      if (status === 'approved') {
        toast.success('Order accepted! Customer notified that you are en route.', 'Order Approved');
      } else if (status === 'completed') {
        toast.success('Order marked as completed! Payment transferred to your balance.', 'Service Completed');
      } else if (status === 'declined') {
        toast.info('Order declined.', 'Order Update');
      }
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to update order status', 'Error');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Incoming Order Requests</h3>
            <p className="text-xs text-slate-400">Live dispatch feed from customer bookings</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="py-12 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80 space-y-3">
          <Scissors className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No incoming orders yet</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Stay tuned! Make sure your Dispatch Status is set to <strong>Online</strong> to receive new requests.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const isPending = o.status === 'pending';
            const isApproved = o.status === 'approved';
            const isCompleted = o.status === 'completed';
            const isDeclined = o.status === 'declined';

            return (
              <div
                key={o.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">#{o.id.substring(0, 8)}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPending
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            : isApproved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isCompleted
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{o.address || 'Address provided on acceptance'}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-lg font-black text-amber-400">{o.price || 100} ILS</span>
                    <p className="text-[10px] text-slate-500 font-mono">Haircut & Styling</p>
                  </div>
                </div>

                {/* Actions */}
                {isPending && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => updateStatus(o.id, 'approved')}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Accept & Start Drive</span>
                    </button>
                    <button
                      onClick={() => updateStatus(o.id, 'declined')}
                      className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}

                {isApproved && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => updateStatus(o.id, 'completed')}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Mark Haircut Completed</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
