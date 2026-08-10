import React, { useState, useEffect } from 'react';
import { Activity, Database, ShieldCheck, Clock, Cpu, RefreshCw, AlertTriangle, Zap, ExternalLink } from 'lucide-react';
import { captureException, captureMessage } from '../../shared/services/sentry';
import { db } from '../../firebase';
import { doc, getDocFromServer } from 'firebase/firestore';
import { useToast } from '../../shared/context/ToastContext';

const EXTERNAL_DASHBOARDS = [
  { name: 'Firebase Console', url: 'https://console.firebase.google.com/', detail: 'Firestore, Auth, Storage, Cloud Functions' },
  { name: 'Stripe Dashboard', url: 'https://dashboard.stripe.com/', detail: 'Payments, refunds, webhook delivery logs' },
  { name: 'Google Cloud Console', url: 'https://console.cloud.google.com/', detail: 'Maps/Distance Matrix API quota & billing' },
];

export default function SystemHealthStatusPage() {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [firestoreStatus, setFirestoreStatus] = useState(null);

  const checkFirestore = async () => {
    setChecking(true);
    const start = performance.now();
    try {
      await getDocFromServer(doc(db, 'categories', '__health_check__'));
      setFirestoreStatus({ ok: true, latencyMs: Math.round(performance.now() - start), checkedAt: new Date() });
    } catch (err) {
      if (err?.code === 'not-found' || err?.code === 'firestore/not-found') {
        setFirestoreStatus({ ok: true, latencyMs: Math.round(performance.now() - start), checkedAt: new Date() });
      } else {
        setFirestoreStatus({ ok: false, latencyMs: null, checkedAt: new Date() });
        captureException(err, { tags: { module: 'SystemHealthCheck' } });
      }
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkFirestore();
  }, []);

  const handleTestSentryAlert = () => {
    const testErr = new Error('TEST: Sentry error triggered manually from System Dashboard');
    captureException(testErr, {
      tags: { source: 'AdminTestTrigger', severity: 'test' },
      extra: { timestamp: new Date().toISOString(), userRole: 'admin' }
    });
    captureMessage('Sentry test event logged from System Health page', 'warning', { component: 'SystemHealthStatusPage' });
    toast.success('Test error & warning sent to Sentry (if VITE_SENTRY_DSN is configured).', 'Sentry Alert Sent');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase">
            <Activity className="w-3.5 h-3.5" />
            <span>System Health</span>
          </div>
          <button
            onClick={checkFirestore}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${checking ? 'animate-spin' : ''}`} />
            <span>Re-Check</span>
          </button>
        </div>

        <h1 className="text-3xl font-black text-white">DropIn Operational Status</h1>
        <p className="text-xs text-slate-400">
          Live connectivity check against Firestore. Other services (Stripe, Cloud Functions, Maps API)
          don't have a dedicated health-check endpoint yet - use the real dashboards below to check them directly.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold text-white">Firestore Database</h3>
          </div>
          {firestoreStatus === null ? (
            <span className="text-[10px] text-slate-500 font-mono">Checking...</span>
          ) : firestoreStatus.ok ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
              <ShieldCheck className="w-3 h-3" />
              <span>Reachable - {firestoreStatus.latencyMs}ms</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase">
              <AlertTriangle className="w-3 h-3" />
              <span>Unreachable</span>
            </span>
          )}
        </div>
        {firestoreStatus?.checkedAt && (
          <p className="text-[11px] font-mono text-slate-500">Last checked: {firestoreStatus.checkedAt.toLocaleTimeString()}</p>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Sentry Error Tracking</h2>
              <p className="text-xs text-slate-400">Sends a real test event if VITE_SENTRY_DSN is configured</p>
            </div>
          </div>
          <button
            onClick={handleTestSentryAlert}
            className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Test Sentry Alert</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EXTERNAL_DASHBOARDS.map((d, idx) => (
          
            key={idx}
            href={d.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-2 shadow-lg transition-all block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-extrabold text-white">{d.name}</h3>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <p className="text-[11px] font-mono text-slate-400 border-t border-slate-950 pt-2">{d.detail}</p>
          </a>
        ))}
      </div>
    </div>
  );
}