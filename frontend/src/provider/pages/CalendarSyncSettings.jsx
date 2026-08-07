import React, { useState } from 'react';
import { Calendar, RefreshCw, CheckCircle2, ShieldCheck, Link2, ExternalLink, Copy, Download } from 'lucide-react';
import { useToast } from '../../shared/context/ToastContext';
import PageHeaderBar from '../../shared/components/PageHeaderBar';
import { downloadICalFile, syncWithGoogleCalendar } from '../../shared/services/calendar';

export default function CalendarSyncSettings() {
  const { toast } = useToast();
  const [googleConnected, setGoogleConnected] = useState(true);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [iCalUrl, setICalUrl] = useState('https://calendar.google.com/calendar/ical/pro_feed_88291.ics');
  const [autoBlockBusy, setAutoBlockBusy] = useState(true);
  const [syncingTest, setSyncingTest] = useState(false);

  const handleToggleGoogle = () => {
    setGoogleConnected((prev) => {
      const next = !prev;
      if (next) toast.success('Google Calendar OAuth connected with scope https://www.googleapis.com/auth/calendar.events!', 'Calendar Connected');
      else toast.info('Google Calendar unlinked.', 'Calendar Unlinked');
      return next;
    });
  };

  const handleTestSyncGoogle = async () => {
    setSyncingTest(true);
    try {
      const dummyOrder = {
        id: 'DEMO-' + Math.floor(1000 + Math.random() * 9000),
        address: 'Rothschild Blvd 45, Tel Aviv',
        price: 120,
        createdAt: { toDate: () => new Date() }
      };
      await syncWithGoogleCalendar(dummyOrder);
      toast.success('Google Calendar event template opened successfully!', 'Sync Tested');
    } catch (err) {
      toast.error(err.message || 'Failed to sync with Google Calendar', 'Sync Error');
    } finally {
      setSyncingTest(false);
    }
  };

  const handleDownloadSampleICal = () => {
    const dummyOrder = {
      id: 'APPT-' + Math.floor(1000 + Math.random() * 9000),
      address: 'Dizengoff St 100, Tel Aviv',
      price: 150,
      createdAt: { toDate: () => new Date() }
    };
    downloadICalFile(dummyOrder);
    toast.success('Sample appointment .ics file downloaded!', 'iCal Downloaded');
  };

  const handleToggleOutlook = () => {
    setOutlookConnected((prev) => {
      const next = !prev;
      if (next) toast.success('Outlook iCal feed connected!', 'Calendar Connected');
      else toast.info('Outlook unlinked.', 'Calendar Unlinked');
      return next;
    });
  };

  const handleCopyDropInFeed = () => {
    navigator.clipboard.writeText('https://dropin.app/api/v2/calendar/feed_token_x99.ics');
    toast.success('DropIn appointments iCal subscription feed URL copied!', 'Feed Copied');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeaderBar
        title="Calendar & Schedule Sync"
        subtitle="Sync external calendars (Google, Outlook, iCal) to automatically prevent double-booking"
        category="Provider Tools"
        breadcrumbs={[
          { label: 'Provider Portal', path: '/provider' },
          { label: 'Calendar Sync' }
        ]}
      />

      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400">
          <Calendar className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-wider">Provider Tool #9</span>
        </div>
        <h1 className="text-2xl font-black text-white">External Calendar Sync (Google / Outlook)</h1>
        <p className="text-xs text-slate-400">
          Connect your personal Google or Outlook calendar to automatically block busy slots on DropIn and prevent double-booking.
        </p>
      </div>

      <div className="space-y-6">
        {/* Google Calendar Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Google Calendar Sync</h3>
                <p className="text-xs text-slate-400">OAuth API Scope: calendar.events</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestSyncGoogle}
                disabled={syncingTest}
                className="py-2.5 px-3.5 rounded-2xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Event Sync</span>
              </button>

              <button
                onClick={handleToggleGoogle}
                className={`py-2.5 px-4 rounded-2xl font-black text-xs transition-all ${
                  googleConnected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                }`}
              >
                {googleConnected ? 'Connected (Active)' : 'Connect Google'}
              </button>
            </div>
          </div>
        </div>

        {/* Outlook Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Outlook & Apple Calendar iCal</h3>
              <p className="text-xs text-slate-400">Import external .ics feed URL</p>
            </div>
          </div>

          <button
            onClick={handleToggleOutlook}
            className={`py-2.5 px-4 rounded-2xl font-black text-xs transition-all ${
              outlookConnected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            {outlookConnected ? 'Connected' : 'Connect iCal Feed'}
          </button>
        </div>

        {/* Auto Block Toggles */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-sm text-white">Calendar Sync Options</h3>

          <label className="flex items-center justify-between gap-3 text-xs text-slate-300 cursor-pointer p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span>Automatically block DropIn booking slots during Google/Outlook busy events</span>
            <input
              type="checkbox"
              checked={autoBlockBusy}
              onChange={(e) => setAutoBlockBusy(e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
          </label>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Your Exportable DropIn iCal Appointment Feed URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value="https://dropin.app/api/v2/calendar/feed_token_x99.ics"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-400"
              />
              <button
                onClick={handleCopyDropInFeed}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Feed</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
