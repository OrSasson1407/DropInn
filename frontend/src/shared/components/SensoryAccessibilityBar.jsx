import React, { useState } from 'react';
import { VolumeX, Sun, Eye, ShieldCheck, Heart, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function SensoryAccessibilityBar({ onPreferencesChange }) {
  const { toast } = useToast();
  const [quietService, setQuietService] = useState(false);
  const [lowNoiseTools, setLowNoiseTools] = useState(false);
  const [chemicalFree, setChemicalFree] = useState(false);
  const [petFriendly, setPetFriendly] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [patchTestRequired, setPatchTestRequired] = useState(false);

  const toggleQuietService = () => {
    const next = !quietService;
    setQuietService(next);
    toast.info(next ? 'Quiet Service Enabled: Barber will provide minimal talking during appointment.' : 'Standard conversation preference set.');
    if (onPreferencesChange) onPreferencesChange({ quietService: next, lowNoiseTools, chemicalFree, petFriendly, patchTestRequired });
  };

  const toggleLowNoise = () => {
    const next = !lowNoiseTools;
    setLowNoiseTools(next);
    toast.info(next ? 'Low-Noise Tools Requested: Low-decibel clippers will be deployed.' : 'Standard tools preference set.');
    if (onPreferencesChange) onPreferencesChange({ quietService, lowNoiseTools: next, chemicalFree, petFriendly, patchTestRequired });
  };

  const togglePatchTest = () => {
    const next = !patchTestRequired;
    setPatchTestRequired(next);
    if (next) {
      toast.success('24-Hour Patch Test Requirement Logged in your safety profile (#42).', 'Chemical Safety Active');
    }
    if (onPreferencesChange) onPreferencesChange({ quietService, lowNoiseTools, chemicalFree, petFriendly, patchTestRequired: next });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          <span>Sensory & Accessibility Preferences (#41, #42, #48)</span>
        </span>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
          Inclusive Grooming Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        {/* Quiet Service */}
        <button
          type="button"
          onClick={toggleQuietService}
          className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
            quietService ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="space-y-0.5">
            <span className="font-extrabold block text-white">Quiet Service Mode</span>
            <span className="text-[10px] text-slate-400 block">Minimal verbal interaction</span>
          </div>
          <VolumeX className={`w-4 h-4 ${quietService ? 'text-amber-400' : 'text-slate-500'}`} />
        </button>

        {/* Low Noise Tools */}
        <button
          type="button"
          onClick={toggleLowNoise}
          className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
            lowNoiseTools ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="space-y-0.5">
            <span className="font-extrabold block text-white">Low-Noise Clippers</span>
            <span className="text-[10px] text-slate-400 block">Low-decibel motor tools</span>
          </div>
          <Sun className={`w-4 h-4 ${lowNoiseTools ? 'text-amber-400' : 'text-slate-500'}`} />
        </button>

        {/* 24-Hour Patch Test Safety Log */}
        <button
          type="button"
          onClick={togglePatchTest}
          className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
            patchTestRequired ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="space-y-0.5">
            <span className="font-extrabold block text-white">Patch Test Verified</span>
            <span className="text-[10px] text-slate-400 block">24h chemical safety log</span>
          </div>
          <ShieldCheck className={`w-4 h-4 ${patchTestRequired ? 'text-emerald-400' : 'text-slate-500'}`} />
        </button>
      </div>
    </div>
  );
}
