import React, { useState, useEffect } from 'react';
import { 
  APIProvider, Map, AdvancedMarker, Pin, InfoWindow 
} from '@vis.gl/react-google-maps';
import { 
  MapPin, Navigation, Compass, Layers, CheckCircle2, AlertCircle, 
  Sparkles, Crosshair, Zap, Shield, ChevronRight, Info, Key, ExternalLink
} from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta)?.env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  globalThis?.GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Preset landmark Tel Aviv / Central region coordinates
const LANDMARKS = [
  { id: 'rothschild', name: 'Rothschild Blvd, Tel Aviv', lat: 32.0636, lng: 34.7734, x: 230, y: 190, district: 'Tel Aviv Center', zone: 'core' },
  { id: 'dizengoff', name: 'Dizengoff Center, Tel Aviv', lat: 32.0753, lng: 34.7752, x: 210, y: 150, district: 'Tel Aviv North', zone: 'core' },
  { id: 'sarona', name: 'Sarona Market, Tel Aviv', lat: 32.0711, lng: 34.7871, x: 260, y: 170, district: 'Tel Aviv East', zone: 'core' },
  { id: 'florentin', name: 'Florentin St, Tel Aviv', lat: 32.0560, lng: 34.7720, x: 220, y: 220, district: 'Tel Aviv South', zone: 'core' },
  { id: 'ramatgan', name: 'Diamond Exchange, Ramat Gan', lat: 32.0833, lng: 34.8021, x: 330, y: 150, district: 'Ramat Gan', zone: 'suburban' },
  { id: 'givatayim', name: 'Katznelson St, Givatayim', lat: 32.0712, lng: 34.8101, x: 320, y: 190, district: 'Givatayim', zone: 'suburban' },
  { id: 'herzliya', name: 'Pituach Marina, Herzliya', lat: 32.1620, lng: 34.7951, x: 190, y: 60, district: 'Herzliya Coast', zone: 'suburban' },
  { id: 'holon', name: 'Sokolov St, Holon', lat: 32.0145, lng: 34.7745, x: 250, y: 290, district: 'Holon', zone: 'outer' }
];

// Active mobile provider base locations
const PROVIDER_BASES = [
  { id: 'p1', name: 'Marco V. (Mobile Unit #1)', lat: 32.0680, lng: 34.7780, x: 220, y: 180, category: 'Barber' },
  { id: 'p2', name: 'Elena R. (Mobile Salon #2)', lat: 32.0780, lng: 34.7900, x: 280, y: 140, category: 'Stylist' },
  { id: 'p3', name: 'David K. (Mobile Groomer #3)', lat: 32.1500, lng: 34.7900, x: 195, y: 90, category: 'Barber' }
];

export default function ServiceCoverageMap({ selectedAddress, onSelectLocation, isCompact = false }) {
  const [pinnedPos, setPinnedPos] = useState({ x: 230, y: 190 });
  const [googleCoords, setGoogleCoords] = useState({ lat: 32.0636, lng: 34.7734 });
  const [pinnedName, setPinnedName] = useState('Rothschild Blvd 45, Tel Aviv');
  const [activeZone, setActiveZone] = useState('core');
  const [distanceKm, setDistanceKm] = useState(1.8);
  const [etaMins, setEtaMins] = useState(14);
  const [mapMode, setMapMode] = useState('interactive'); // 'interactive' | 'coverage'
  const [isLocating, setIsLocating] = useState(false);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);

  // Sync internal pin if selectedAddress matches a landmark or changes externally
  useEffect(() => {
    if (!selectedAddress) return;
    const matched = LANDMARKS.find(l => selectedAddress.toLowerCase().includes(l.id) || selectedAddress.toLowerCase().includes(l.district.toLowerCase()));
    if (matched) {
      setPinnedPos({ x: matched.x, y: matched.y });
      setGoogleCoords({ lat: matched.lat, lng: matched.lng });
      setPinnedName(matched.name);
      setActiveZone(matched.zone);
    }
  }, [selectedAddress]);

  // Handle map click on SVG Base Map
  const handleSvgMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 500);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 350);

    const distPx = Math.sqrt(Math.pow(x - 220, 2) + Math.pow(y - 170, 2));
    const calculatedKm = Number((distPx / 25).toFixed(1));
    const calculatedEta = Math.max(10, Math.round(calculatedKm * 3 + 8));

    let zone = 'core';
    let zoneAddress = 'Tel Aviv District';

    if (distPx <= 110) {
      zone = 'core';
      zoneAddress = x < 230 ? 'Rothschild & Center, Tel Aviv' : 'Sarona & East, Tel Aviv';
    } else if (distPx <= 180) {
      zone = 'suburban';
      zoneAddress = x > 300 ? 'Ramat Gan / Givatayim Zone' : y < 100 ? 'Herzliya North Zone' : 'Tel Aviv Metro Outer';
    } else {
      zone = 'outer';
      zoneAddress = 'Extended Metro Boundary';
    }

    let closestLandmark = LANDMARKS[0];
    let minD = Infinity;
    LANDMARKS.forEach(l => {
      const d = Math.sqrt(Math.pow(x - l.x, 2) + Math.pow(y - l.y, 2));
      if (d < minD) {
        minD = d;
        closestLandmark = l;
      }
    });

    const resolvedAddress = minD < 45 ? closestLandmark.name : `${zoneAddress} (Pin #${x.toString().slice(-2)}${y.toString().slice(-2)})`;

    setPinnedPos({ x, y });
    setGoogleCoords({ lat: closestLandmark.lat, lng: closestLandmark.lng });
    setPinnedName(resolvedAddress);
    setActiveZone(zone);
    setDistanceKm(calculatedKm);
    setEtaMins(calculatedEta);

    if (onSelectLocation) {
      onSelectLocation(resolvedAddress, { x, y, zone, calculatedKm, calculatedEta });
    }
  };

  // Handle click on Google Map directly
  const handleGoogleMapClick = (e) => {
    if (!e.detail?.latLng) return;
    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;

    // Calculate approx distance from hub (32.0711, 34.7871)
    const dLat = (lat - 32.0711) * 111;
    const dLng = (lng - 34.7871) * 91;
    const calculatedKm = Number(Math.sqrt(dLat * dLat + dLng * dLng).toFixed(1));
    const calculatedEta = Math.max(10, Math.round(calculatedKm * 3 + 8));

    const zone = calculatedKm <= 6 ? 'core' : calculatedKm <= 15 ? 'suburban' : 'outer';
    const resolvedAddress = `Service Spot (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

    setGoogleCoords({ lat, lng });
    setPinnedName(resolvedAddress);
    setActiveZone(zone);
    setDistanceKm(calculatedKm);
    setEtaMins(calculatedEta);

    if (onSelectLocation) {
      onSelectLocation(resolvedAddress, { lat, lng, zone, calculatedKm, calculatedEta });
    }
  };

  // Select landmark preset
  const handleSelectLandmark = (lm) => {
    setPinnedPos({ x: lm.x, y: lm.y });
    setGoogleCoords({ lat: lm.lat, lng: lm.lng });
    setPinnedName(lm.name);
    setActiveZone(lm.zone);

    const distPx = Math.sqrt(Math.pow(lm.x - 220, 2) + Math.pow(lm.y - 170, 2));
    const calculatedKm = Number((distPx / 25).toFixed(1));
    const calculatedEta = Math.max(10, Math.round(calculatedKm * 3 + 8));
    
    setDistanceKm(calculatedKm);
    setEtaMins(calculatedEta);

    if (onSelectLocation) {
      onSelectLocation(lm.name, { x: lm.x, y: lm.y, zone: lm.zone, calculatedKm, calculatedEta });
    }
  };

  // Simulate current GPS location detection
  const handleSimulateGps = () => {
    setIsLocating(true);
    setTimeout(() => {
      const gpsLandmark = LANDMARKS[0]; // Rothschild Center
      handleSelectLandmark(gpsLandmark);
      setIsLocating(false);
    }, 700);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-extrabold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>Google Maps Mobile Dispatch Engine</span>
          </span>
          <h3 className="text-base font-black text-white mt-0.5 flex items-center gap-2">
            <span>Service Territory & Exact Location Pin</span>
            {hasValidKey ? (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Google Maps API Active
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                Interactive Canvas Map Mode
              </span>
            )}
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateGps}
            disabled={isLocating}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Crosshair className={`w-3.5 h-3.5 text-amber-500 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
          </button>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setMapMode('interactive')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapMode === 'interactive' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pin Location
            </button>
            <button
              type="button"
              onClick={() => setMapMode('coverage')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapMode === 'coverage' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Zones
            </button>
          </div>
        </div>
      </div>

      {/* Google Maps Setup Instructions Banner if Key Missing */}
      {!hasValidKey && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-2 text-slate-300">
          <div className="flex items-center justify-between text-amber-400 font-extrabold">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span>Connect Google Maps JavaScript API (Optional)</span>
            </div>
            <a 
              href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[11px] underline flex items-center gap-1 hover:text-amber-300"
            >
              <span>Get API Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            To enable live satellite mapping & Google Places autocomplete, add secret <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 font-mono">GOOGLE_MAPS_PLATFORM_KEY</code> in <strong>Settings ⚙️ → Secrets</strong>. The app works automatically!
          </p>
        </div>
      )}

      {/* Map Rendering Stage */}
      <div className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner group">
        {hasValidKey ? (
          /* Live Google Maps JS API View */
          <div style={{ width: '100%', height: '340px' }}>
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={{ lat: 32.0711, lng: 34.7871 }}
                defaultZoom={13}
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                onClick={handleGoogleMapClick}
              >
                {/* User Pinned Location */}
                <AdvancedMarker position={googleCoords} title="Your Service Destination">
                  <Pin background="#f59e0b" glyphColor="#0f172a" borderColor="#ffffff" />
                </AdvancedMarker>

                {/* Mobile Barber Base Units */}
                {PROVIDER_BASES.map((p) => (
                  <AdvancedMarker
                    key={p.id}
                    position={{ lat: p.lat, lng: p.lng }}
                    onClick={() => setActiveInfoWindow(p.id)}
                  >
                    <Pin background="#10b981" glyphColor="#ffffff" />
                  </AdvancedMarker>
                ))}

                {/* Landmarks Markers */}
                {LANDMARKS.map((lm) => (
                  <AdvancedMarker
                    key={lm.id}
                    position={{ lat: lm.lat, lng: lm.lng }}
                    onClick={() => handleSelectLandmark(lm)}
                  >
                    <Pin background="#3b82f6" glyphColor="#ffffff" />
                  </AdvancedMarker>
                ))}

                {activeInfoWindow && (
                  <InfoWindow
                    position={{ lat: 32.0711, lng: 34.7871 }}
                    onCloseClick={() => setActiveInfoWindow(null)}
                  >
                    <div className="text-slate-900 font-sans p-1">
                      <strong className="block text-xs font-black">DropIn Mobile HQ</strong>
                      <span className="text-[10px] text-slate-600 block">3 Mobile Barber Units Active</span>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          </div>
        ) : (
          /* Interactive SVG Canvas Map View */
          <svg
            viewBox="0 0 500 350"
            className="w-full h-auto cursor-crosshair select-none"
            onClick={handleSvgMapClick}
          >
            <defs>
              <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#292524" strokeWidth="0.5" opacity="0.4" />
              </pattern>
              <radialGradient id="coreZoneGlow" cx="44%" cy="48%" r="40%">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#d97706" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="suburbanZoneGlow" cx="44%" cy="48%" r="65%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="500" height="350" fill="#0f172a" />
            <rect width="500" height="350" fill="url(#mapGrid)" />

            <path
              d="M 0 0 Q 110 90, 100 180 T 130 350 L 0 350 Z"
              fill="#0284c7"
              opacity="0.15"
            />
            <path
              d="M 0 0 Q 110 90, 100 180 T 130 350"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              opacity="0.4"
              strokeDasharray="4 4"
            />
            <text x="25" y="180" fill="#38bdf8" fontSize="10" fontWeight="bold" opacity="0.6" letterSpacing="1">
              MEDITERRANEAN SEA
            </text>

            <path d="M 120 0 Q 220 180, 260 350" fill="none" stroke="#475569" strokeWidth="4" opacity="0.5" />
            <path d="M 120 0 Q 220 180, 260 350" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" strokeDasharray="6 6" />
            <path d="M 100 190 Q 350 170, 500 190" fill="none" stroke="#475569" strokeWidth="3" opacity="0.4" />

            <circle
              cx="220"
              cy="170"
              r="160"
              fill="url(#suburbanZoneGlow)"
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              opacity="0.6"
            />
            {mapMode === 'coverage' && (
              <text x="350" y="70" fill="#60a5fa" fontSize="9" fontWeight="bold" opacity="0.8">
                SUBURBAN DISPATCH ZONE (15 KM)
              </text>
            )}

            <circle
              cx="220"
              cy="170"
              r="95"
              fill="url(#coreZoneGlow)"
              stroke="#d97706"
              strokeWidth="2"
              opacity="0.8"
            />
            {mapMode === 'coverage' && (
              <text x="230" y="100" fill="#fbbf24" fontSize="10" fontWeight="bold" opacity="0.9">
                CORE ZONE (FREE INSTANT DISPATCH)
              </text>
            )}

            <line
              x1="220"
              y1="170"
              x2={pinnedPos.x}
              y2={pinnedPos.y}
              stroke="#d97706"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="animate-pulse"
            />

            <g transform="translate(220, 170)">
              <circle r="16" fill="#d97706" opacity="0.2" className="animate-ping" />
              <circle r="8" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
              <text x="12" y="4" fill="#fbbf24" fontSize="9" fontWeight="extrabold">
                DROPIN HQ HUB
              </text>
            </g>

            {PROVIDER_BASES.map((p) => (
              <g key={p.id} transform={`translate(${p.x}, ${p.y})`}>
                <circle r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                <text x="8" y="-4" fill="#34d399" fontSize="8" fontWeight="bold">
                  {p.name.split(' ')[0]} (Active)
                </text>
              </g>
            ))}

            {LANDMARKS.map((lm) => {
              const isSelected = pinnedPos.x === lm.x && pinnedPos.y === lm.y;
              return (
                <g
                  key={lm.id}
                  transform={`translate(${lm.x}, ${lm.y})`}
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectLandmark(lm);
                  }}
                >
                  <circle
                    r={isSelected ? "7" : "4"}
                    fill={isSelected ? "#d97706" : lm.zone === 'core' ? '#38bdf8' : '#94a3b8'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x="8"
                    y="12"
                    fill={isSelected ? "#ffffff" : "#94a3b8"}
                    fontSize="8"
                    fontWeight={isSelected ? "900" : "bold"}
                  >
                    {lm.district}
                  </text>
                </g>
              );
            })}

            <g transform={`translate(${pinnedPos.x}, ${pinnedPos.y})`}>
              <circle r="22" fill="#d97706" opacity="0.25" className="animate-ping" />
              <circle r="12" fill="#d97706" opacity="0.4" />
              <circle r="6" fill="#ffffff" stroke="#d97706" strokeWidth="3" />
            </g>
          </svg>
        )}

        {/* Floating Address Card Overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <MapPin className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pinned Location</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                  activeZone === 'core' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : activeZone === 'suburban'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {activeZone === 'core' ? 'Core Zone (Free)' : activeZone === 'suburban' ? 'Suburban (+10 ILS)' : 'Outer Limit'}
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate mt-0.5">{pinnedName}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block font-semibold">Dispatch ETA</span>
            <span className="text-xs font-extrabold text-amber-400">{etaMins} mins ({distanceKm} km)</span>
          </div>
        </div>
      </div>

      {/* Landmark Quick Selection Pills */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Quick Selection Hotspots
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {LANDMARKS.map((lm) => {
            const isSelected = pinnedName === lm.name;
            return (
              <button
                key={lm.id}
                type="button"
                onClick={() => handleSelectLandmark(lm)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                📍 {lm.district}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coverage Status Info Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Mobile Barber Units active in Tel Aviv Metropolitan & Central Region</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          3 Pros On Duty
        </span>
      </div>
    </div>
  );
}
