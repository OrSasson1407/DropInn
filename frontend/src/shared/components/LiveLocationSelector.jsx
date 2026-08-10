import React from 'react';
import { useRealLocationData } from '../hooks/useRealLocationData';

export default function LiveLocationSelector() {
  const { location, prosOnDuty, loading, refetchLocation } = useRealLocationData();

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-2">Service Delivery Location & Interactive Map Pin</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">Pinned Location</p>
        <p className="text-md font-semibold text-blue-600">
          {loading ? 'Fetching satellite data...' : location.address}
        </p>
        {location.lat && (
          <p className="text-xs text-gray-400">
            Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        )}
      </div>

      <button 
        onClick={refetchLocation}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4"
      >
        📍 Use My Exact GPS
      </button>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-500">Mobile Barber Units active in Region</p>
        <p className="text-lg font-bold text-green-500">
          {loading ? 'Checking...' : \\ Pros On Duty\}
        </p>
      </div>
    </div>
  );
}
