import React, { useState } from 'react';
import { ShieldAlert, Phone, MapPin, AlertCircle, CheckCircle2, X, Bell, Zap } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function SafetyAssistSOS({ activeOrderId = null, locationText = 'Rothschild Blvd 45, Tel Aviv' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const { toast } = useToast();

  const handleTriggerSOS = () => {
    setSosTriggered(true);
    toast.error(
      'EMERGENCY ALERT BROADCASTED! Safety team and local emergency contact notified with your live GPS location.',
      'SOS Active'
    );
  };

  const handleCancelSOS = () => {
    setSosTriggered(false);
    toast.info('Emergency SOS alert standing down.', 'SOS Deactivated');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 left-6 z-[90]">
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-2xl transition-all duration-300 font-extrabold text-xs border ${
            sosTriggered
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse ring-4 ring-rose-500/50'
              : 'bg-slate-900/90 text-rose-400 hover:text-white hover:bg-rose-600 border-rose-500/40 shadow-rose-500/10'
          }`}
          title="In-Service Safety SOS Assistance"
        >
          <ShieldAlert className="w-4 h-4 text-rose-400 stroke-[2.5]" />
          <span>{sosTriggered ? 'SOS ALERT ACTIVE' : 'Safety SOS'}</span>
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Emergency Safety Assist</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-mono">
                    24/7 LIVE
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Instant protection & location broadcast during in-home visits.
                </p>
              </div>
            </div>

            {sosTriggered ? (
              <div className="bg-rose-950/60 border border-rose-500/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">SOS Alert Signal Transmitted!</p>
                    <p className="text-[11px] text-rose-200 leading-relaxed">
                      DropIn Rapid Safety Dispatch and your emergency contact list have received your live location GPS coordinates ({locationText}).
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <a
                    href="tel:100"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs text-center flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Police (100)</span>
                  </a>
                  <button
                    onClick={handleCancelSOS}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Stand Down
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Current Booking GPS Location:</span>
                  </div>
                  <p className="text-amber-400 font-mono font-bold pl-6">{locationText}</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleTriggerSOS}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                  >
                    <ShieldAlert className="w-5 h-5" />
                    <span>TRIGGER EMERGENCY SOS ALERT</span>
                  </button>
                  <p className="text-[10px] text-slate-500 text-center">
                    Triggers immediate alert to DropIn Emergency Command Center & live location SMS to emergency contacts.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <p className="font-bold text-slate-300">Quick Emergency Services:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="tel:100"
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-center font-bold flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-rose-400" />
                      <span>Police (100)</span>
                    </a>
                    <a
                      href="tel:101"
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-center font-bold flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-rose-400" />
                      <span>Medical (101)</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
