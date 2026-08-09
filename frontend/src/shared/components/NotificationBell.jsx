import React, { useState, useEffect } from 'react';
import { Bell, Check, X, ShieldAlert, AlertCircle, ShoppingBag, Smartphone, CheckCircle2 } from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useFcmNotification } from '../hooks/useFcmNotification';
import { useToast } from '../context/ToastContext';

export default function NotificationBell() {
  const { currentUser, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { permission, loading, requestNotificationPermission, token } = useFcmNotification();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    // Query notifications for user or admin
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', 'in', [currentUser.uid, isAdmin ? 'ADMIN_SAFETY_TEAM' : currentUser.uid])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort newest first
      items.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setNotifications(items);
    }, (err) => {
      console.warn('Notification listener error:', err);
    });

    return () => unsubscribe();
  }, [currentUser, isAdmin]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.warn('Could not mark notification read:', err);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white">Notifications</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* FCM Push Notification Banner */}
          <div className="p-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-200 truncate">FCM Push Delivery</p>
                <p className="text-[10px] text-slate-400 truncate">
                  {permission === 'granted' ? 'Active & Synced to Firestore' : 'Enable browser push alerts'}
                </p>
              </div>
            </div>

            {permission === 'granted' ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active</span>
              </span>
            ) : (
              <button
                onClick={requestNotificationPermission}
                disabled={loading}
                className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black transition-all shrink-0"
              >
                {loading ? 'Enabling...' : 'Enable FCM'}
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3 text-xs space-y-1 transition-colors cursor-pointer hover:bg-slate-800/50 ${
                    !n.read ? 'bg-amber-500/5 border-l-2 border-amber-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      {n.type === 'SOS' ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      ) : (
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{n.title}</span>
                    </span>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{n.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
