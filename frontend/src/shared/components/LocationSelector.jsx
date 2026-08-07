import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Check, Sparkles } from 'lucide-react';
import { SUPPORTED_REGIONS } from '../config/navConfig';

export default function LocationSelector() {
  const [selectedRegion, setSelectedRegion] = useState(() => {
    return localStorage.getItem('dropin_selected_region') || 'all';
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeRegionObj = SUPPORTED_REGIONS.find(r => r.id === selectedRegion) || SUPPORTED_REGIONS[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectRegion = (regionId) => {
    setSelectedRegion(regionId);
    localStorage.setItem('dropin_selected_region', regionId);
    window.dispatchEvent(new CustomEvent('dropin-location-changed', { detail: { regionId } }));
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select service location region"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-amber-400 hover:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all cursor-pointer shadow-sm group"
      >
        <MapPin className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="truncate max-w-[130px] sm:max-w-[160px]">{activeRegionObj.name}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 sm:left-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-3 py-2 border-b border-slate-800/80 mb-1 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Service Coverage Zone
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Israel</span>
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
            {SUPPORTED_REGIONS.map((region) => {
              const isSelected = region.id === selectedRegion;
              return (
                <button
                  key={region.id}
                  onClick={() => handleSelectRegion(region.id)}
                  role="menuitem"
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start justify-between gap-2 group ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs leading-none flex items-center gap-1.5">
                      <span>{region.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal leading-tight">
                      {region.detail}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
