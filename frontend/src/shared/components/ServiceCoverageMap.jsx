import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ServiceCoverageMap({ selectedAddress, isCompact, defaultLat, defaultLng }) {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY;
    if (!apiKey) return setError("Google Maps API key is missing");

    const initMap = () => {
      if (!mapRef.current) return;
      
      // Use passed GPS coords from Bar Ilan, fallback to generic middle of Israel if null
      const centerLoc = { 
        lat: defaultLat || 32.0684, 
        lng: defaultLng || 34.8248 
      };

      const map = new window.google.maps.Map(mapRef.current, {
        center: centerLoc,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] }
        ]
      });
      
      const newMarker = new window.google.maps.Marker({
        map, position: centerLoc, animation: window.google.maps.Animation.DROP,
      });

      setMapInstance(map);
      setMarker(newMarker);
      setLoading(false);
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [defaultLat, defaultLng]);

  useEffect(() => {
    if (!mapInstance || !selectedAddress || !window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: selectedAddress }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        mapInstance.panTo(loc);
        if (marker) marker.setPosition(loc);
      }
    });
  }, [selectedAddress, mapInstance, marker]);

  if (error) return <div className="p-4 text-rose-400">{error}</div>;

  return (
    <div className={`w-full relative overflow-hidden rounded-2xl border border-slate-700 ${isCompact ? 'h-48' : 'h-72'}`}>
      {loading && (
        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center z-10">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400 mb-2" />
          <span className="text-xs text-slate-400 font-bold uppercase">Loading Satellite...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
