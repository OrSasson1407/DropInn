import React, { useEffect, useState } from 'react';
import { Calendar, ExternalLink, Copy, Download } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../shared/context/AuthContext';
import { useToast } from '../../shared/context/ToastContext';
import PageHeaderBar from '../../shared/components/PageHeaderBar';
import { downloadICalFile, syncWithGoogleCalendar } from '../../shared/services/calendar';

export default function CalendarSyncSettings() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [nextOrder, setNextOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [syncingTest, setSyncingTest] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'orders'), where('providerId', '==', currentUser.uid));
    getDocs(q)
      .then((snap) => {
        const items = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((o) => o.status === 'approved' || o.status === 'pending');
        items.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
        setNextOrder(items[0] || null);
      })
      .finally(() => setLoadingOrder(false));
  }, [currentUser]);

  const handleSyncGoogle = async () => {
    if (!nextOrder) return;
    setSyncingTest(true);
    try {
      await syncWithGoogleCalendar(nextOrder);
      toast.success('Google Calendar event opened for your next appointment!', 'Sync Started');
    } catch (err) {
      toast.error(err.message || 'Failed to sync with Google Calendar', 'Sync Error');
    } finally {
      setSyncingTest(false);
    }
  };

  const handleDownloadICal = () => {
    if (!nextOrder) return;
    downloadICalFile(nextOrder);
    toast.success('Appointment .ics file downloaded!', 'iCal Downloaded');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeaderBar
        title="Calendar & Schedule Sync"
        subtitle="Export your upcoming appointments to Google Calendar or iCal"
        category="Provider Tools"
        breadcrumbs={[
          { label: 'Provider Portal', path: '/provider' },
          { label: 'Calendar Sync' }
        ]}
      />

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400">
          <Calendar className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-wider">Provider Tool #9</span>
        </div>
        <h1 className="text-2xl font-black text-white">Export Appointments</h1>
        <p className="text-xs text-slate-400">
          Add your next DropIn appointment to Google Calendar or download it as a calendar file.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Next Appointment</h3>
                <p className="text-xs text-slate-400">
                  {loadingOrder
                    ? 'Loading...'
                    : nextOrder
                      ? `${nextOrder.address || 'Client address'} - ${nextOrder.price ?? '-'} ILS`
                      : 'No upcoming appointments'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncGoogle}
                disabled={syncingTest || !nextOrder}
                className="py-2.5 px-3.5 rounded-2xl bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-blue-300 border border-blue-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Add to Google Calendar</span>
              </button>

              <button
                onClick={handleDownloadICal}
                disabled={!nextOrder}
                className="py-2.5 px-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ics</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-xl opacity-60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Live Calendar Feed (Outlook / Apple)</h3>
              <p className="text-xs text-slate-400">Auto-updating .ics subscription feed - coming soon</p>
            </div>
          </div>
          <span className="py-2.5 px-4 rounded-2xl font-black text-xs bg-slate-950 text-slate-500 border border-slate-800">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}