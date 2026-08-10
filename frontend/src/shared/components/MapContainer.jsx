import React, { useState, useEffect } from 'react';
import { 
  APIProvider, Map, AdvancedMarker, Pin, InfoWindow 
} from '@vis.gl/react-google-maps';
import { 
  MapPin, Compass, Shield, CheckCircle2, Sliders, Layers, 
  Sparkles, Key, ExternalLink, Zap
} from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta)?.env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  globalThis?.GOOGLE_MAPS_PLATFORM_KEY ||
  '';

// Check that API_KEY exists, is not default placeholder, and matches Google Maps key structure (starts with AIza)
const isKeyValidFormat = 
  Boolean(API_KEY) && 
  API_KEY !== 'YOUR_API_KEY' && 
  API_KEY !== 'undefined' &&
  API_KEY !== 'null' &&
  typeof API_KEY === 'string' &&
  API_KEY.startsWith('AIza') &&
  API_KEY.length >= 30;

// Custom 'Warm Luxury' Dark Slate & Grey Map Style Matrix
const LUXURY_GREY_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f59e0b' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#d97706' }, { opacity: 0.6 }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0284c7' }, { opacity: 0.3 }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  }
];

export default function MapContainer({
  center = { lat: 32.0711, lng: 34.7871 },
  zoom = 12,
  defaultRadiusKm = 10,
  onPinCoverage,
  readOnly = false,
  title = "Provider Mobile Service Territory",
  markers = null,
  onMarkerClick
}) {
  // Multi-marker "browse providers" mode: no click-to-pin, no radius drawer,
  // just the customer's location plus a pin per provider.
  const isMarkersMode = Array.isArray(markers);
  const effectiveReadOnly = readOnly || isMarkersMode;

  const [pinnedCoords, setPinnedCoords] = useState(center);
  const [radiusKm, setRadiusKm] = useState(defaultRadiusKm);
  const [pinnedName, setPinnedName] = useState("Tel Aviv Metropolitan Central Hub");
  const [isHovered, setIsHovered] = useState(false);
  const [mapAuthError, setMapAuthError] = useState(false);
  const [activeMarkerId, setActiveMarkerId] = useState(null);

  // Intercept Google Maps auth failure gracefully
  useEffect(() => {
    const prevAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      console.warn('Google Maps API Key Authentication Failed. Switching to Grey Luxury Canvas Mode.');
      setMapAuthError(true);
      if (typeof prevAuthFailure === 'function') prevAuthFailure();
    };
    return () => {
      window.gm_authFailure = prevAuthFailure;
    };
  }, []);

  const canRenderGoogleMap = isKeyValidFormat && !mapAuthError;

  // Sync center changes
  useEffect(() => {
    if (center?.lat && center?.lng) {
      setPinnedCoords(center);
    }
  }, [center]);

  const handleMapClick = (e) => {
    if (effectiveReadOnly) return;
    if (!e.detail?.latLng) return;
    const lat = Number(e.detail.latLng.lat.toFixed(5));
    const lng = Number(e.detail.latLng.lng.toFixed(5));

    const newCoords = { lat, lng };
    const resolvedName = `Mobile Dispatch Hub (${lat}, ${lng})`;

    setPinnedCoords(newCoords);
    setPinnedName(resolvedName);

    if (onPinCoverage) {
      onPinCoverage({
        center: newCoords,
        radiusKm,
        name: resolvedName
      });
    }
  };

  const handleRadiusChange = (newR) => {
    setRadiusKm(newR);
    if (onPinCoverage) {
      onPinCoverage({
        center: pinnedCoords,
        radiusKm: newR,
        name: pinnedName
      });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-extrabold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>MapContainer Component</span>
          </span>
          <h3 className="text-base font-black text-white mt-0.5 flex items-center gap-2">
            <span>{title}</span>
            <span className="bg-amber-500/20 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
              Grey Luxury Theme
            </span>
          </h3>
        </div>

        {/* Coverage Radius Slider */}
        {!effectiveReadOnly && (
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Coverage Radius:</span>
            </span>
            <input
              type="range"
              min="2"
              max="35"
              value={radiusKm}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-24 accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-amber-400 font-bold">{radiusKm} km</span>
          </div>
        )}
      </div>

      {/* Map Display Box */}
      <div className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner h-[360px]">
        {canRenderGoogleMap ? (
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={pinnedCoords}
              center={pinnedCoords}
              defaultZoom={zoom}
              mapId="DEMO_MAP_ID"
              styles={LUXURY_GREY_MAP_STYLE}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              onClick={handleMapClick}
            >
              {isMarkersMode ? (
                <>
                  <AdvancedMarker position={center} title="Your Location">
                    <Pin background="#38bdf8" glyphColor="#0f172a" borderColor="#ffffff" />
                  </AdvancedMarker>
                  {markers.map((m) => (
                    <AdvancedMarker
                      key={m.id}
                      position={{ lat: m.lat, lng: m.lng }}
                      title={m.label || 'Provider'}
                      onClick={() => {
                        setActiveMarkerId(m.id);
                        if (onMarkerClick) onMarkerClick(m);
                      }}
                    >
                      <Pin background="#f59e0b" glyphColor="#0f172a" borderColor="#ffffff" />
                    </AdvancedMarker>
                  ))}
                  {activeMarkerId && (() => {
                    const active = markers.find((m) => m.id === activeMarkerId);
                    if (!active) return null;
                    return (
                      <InfoWindow
                        position={{ lat: active.lat, lng: active.lng }}
                        onCloseClick={() => setActiveMarkerId(null)}
                      >
                        <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '12px' }}>
                          {active.label}
                          {active.sublabel && (
                            <div style={{ fontWeight: 500, opacity: 0.8 }}>{active.sublabel}</div>
                          )}
                        </div>
                      </InfoWindow>
                    );
                  })()}
                </>
              ) : (
                <AdvancedMarker position={pinnedCoords} title="Provider Dispatch Base">
                  <Pin background="#f59e0b" glyphColor="#0f172a" borderColor="#ffffff" />
                </AdvancedMarker>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* SVG Fallback Canvas styled with Grey Warm Luxury Aesthetic */
          <div className="w-full h-full relative bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none cursor-crosshair" onClick={() => !effectiveReadOnly && handleMapClick({ detail: { latLng: { lat: 32.0711, lng: 34.7871 } } })}>
            {/* Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-30">
              <pattern id="greyMapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#334155" strokeWidth="0.8" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#greyMapGrid)" />

              {!isMarkersMode && (
                <>
                  {/* Coverage Circle */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r={radiusKm * 6 + 20}
                    fill="#f59e0b"
                    fillOpacity="0.1"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                  {/* Center Pin */}
                  <circle cx="50%" cy="50%" r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
                </>
              )}
            </svg>

            <div className="relative z-10 space-y-2 pointer-events-none bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-2xl max-w-sm max-h-full overflow-auto">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                <MapPin className="w-5 h-5 stroke-[2.5]" />
              </div>
              {isMarkersMode ? (
                <>
                  <h4 className="font-black text-white text-xs">Map preview unavailable</h4>
                  <p className="text-[11px] text-slate-400">
                    Add a Google Maps key to see live pins. {markers.length} provider{markers.length === 1 ? '' : 's'} nearby:
                  </p>
                  <ul className="text-[11px] text-amber-400 font-semibold space-y-0.5 text-left">
                    {markers.slice(0, 6).map((m) => (
                      <li key={m.id}>• {m.label || 'Provider'}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <h4 className="font-black text-white text-xs">Grey Luxury Coverage Map Active</h4>
                  <p className="text-[11px] text-slate-400">
                    Base location pinned at <strong className="text-amber-400 font-mono">{pinnedCoords.lat}, {pinnedCoords.lng}</strong>. Serving a <strong className="text-amber-400 font-mono">{radiusKm} km</strong> radius zone.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Info Card Overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <MapPin className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isMarkersMode ? 'Your Location' : 'Service Base Hub'}
              </span>
              <p className="text-xs font-bold text-white truncate">
                {isMarkersMode ? 'Centered on your device' : pinnedName}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            {isMarkersMode ? (
              <>
                <span className="text-[10px] text-slate-400 block font-semibold">Providers Shown</span>
                <span className="text-xs font-extrabold text-amber-400">{markers.length}</span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-slate-400 block font-semibold">Service Boundary</span>
                <span className="text-xs font-extrabold text-amber-400">{radiusKm} km radius</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
