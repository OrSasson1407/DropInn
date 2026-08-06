import React, { useState } from 'react';
import { MapPin, Sliders, CheckCircle2, ShieldCheck, Map, Navigation, Layers, Compass } from 'lucide-react';
import { useToast } from '../../shared/context/ToastContext';

export default function CoverageZoneDrawer() {
  const { toast } = useToast();
  const [coverageRadius, setCoverageRadius] = useState(5); // km
  const [baseTravelFee, setBaseTravelFee] = useState(15); // ILS
  const [maxTravelDistance, setMaxTravelDistance] = useState(12); // km
  const [selectedZonePreset, setSelectedZonePreset] = useState('tel_aviv_center');

  const zonePresets = [
    { id: 'tel_aviv_center', name: 'Tel Aviv Center & Rothschild', polygonPoints: '4 Points (PostGIS Polygon)' },
    { id: 'herzliya_pituach', name: 'Herzliya & Marina Coast', polygonPoints: '6 Points (PostGIS Polygon)' },
    { id: 'ramat_gan', name: 'Ramat Gan & Givatayim', polygonPoints: '5 Points (PostGIS Polygon)' },
    { id: 'custom_drawn', name: 'Custom Visual Canvas Polygon', polygonPoints: '8 Drawn Coordinates' }
  ];

  const handleSaveZone = (e) => {
    e.preventDefault();
    toast.success(
      `Service Coverage Zone updated! Set to ${coverageRadius} km radius around base coordinates.`,
      'Coverage Saved'
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400">
          <Map className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-wider">Provider Tool #6</span>
        </div>
        <h1 className="text-2xl font-black text-white">Interactive Coverage Zone & Polygon Drawer</h1>
        <p className="text-xs text-slate-400">
          Draw your custom service coverage boundaries or set kilometer radiuses. Inbound booking requests outside this polygon will be blocked or assessed travel surge fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <span>Coverage Radius & Travel Fees</span>
          </h2>

          <form onSubmit={handleSaveZone} className="space-y-5 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-300 mb-2">
                <span>Standard Dispatch Radius:</span>
                <span className="text-amber-400 font-mono font-black">{coverageRadius} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={coverageRadius}
                onChange={(e) => setCoverageRadius(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Clients within {coverageRadius} km pay standard travel fee ({baseTravelFee} ILS).
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Base Travel Fee (ILS)</label>
                <input
                  type="number"
                  value={baseTravelFee}
                  onChange={(e) => setBaseTravelFee(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Max Travel Distance (km)</label>
                <input
                  type="number"
                  value={maxTravelDistance}
                  onChange={(e) => setMaxTravelDistance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Polygon Preset Selector */}
            <div>
              <label className="block font-bold text-slate-300 mb-2">Active PostGIS Polygon Preset</label>
              <div className="space-y-2">
                {zonePresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedZonePreset(preset.id)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                      selectedZonePreset === preset.id
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block">{preset.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">{preset.polygonPoints}</span>
                    </div>
                    {selectedZonePreset === preset.id && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20"
            >
              Save Coverage Boundaries
            </button>
          </form>
        </div>

        {/* Visual Map / Canvas Polygon Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-400" />
                <span>Interactive Polygon Canvas</span>
              </h2>
              <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-1 rounded-full font-mono">
                PostGIS ST_Contains
              </span>
            </div>

            {/* Simulated Canvas Map */}
            <div className="relative aspect-square rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-4">
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              {/* Drawn Polygon Ring */}
              <div className="relative w-3/4 h-3/4 rounded-full border-2 border-dashed border-amber-500 bg-amber-500/10 flex items-center justify-center animate-pulse">
                <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-slate-950 shadow-lg" />
                <span className="absolute top-2 text-[10px] font-mono text-amber-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                  {coverageRadius} km Polygon Zone
                </span>
              </div>

              {/* Pin Indicator */}
              <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-[10px] space-y-1 text-slate-300">
                <p className="font-bold text-white">Center Base Point:</p>
                <p className="font-mono text-amber-400">32.0853° N, 34.7818° E (Tel Aviv)</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-[11px] font-mono text-slate-400 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[9px]">PostGIS Polygon Export JSON:</span>
            <p className="text-emerald-400 truncate">
              {`{"type":"Polygon","coordinates":[[[34.77,32.07],[34.79,32.09],[34.78,32.11],[34.77,32.07]]]}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
