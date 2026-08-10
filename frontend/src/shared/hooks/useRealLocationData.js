import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../firebase';

export const useRealLocationData = () => {
  const [location, setLocation] = useState({ lat: null, lng: null, address: 'Locating...' });
  const [prosOnDuty, setProsOnDuty] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRealLocation = useCallback(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY;
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
            const data = await response.json();
            const address = data.results[0]?.formatted_address || 'Address not found';
            
            setLocation({ lat: latitude, lng: longitude, address });
          } catch (error) {
            console.error("Geocoding failed:", error);
            setLocation({ lat: latitude, lng: longitude, address: 'Coordinates found, address lookup failed' });
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("GPS Error:", error);
          setLocation(prev => ({ ...prev, address: 'GPS Permission Denied' }));
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const fetchActivePros = useCallback(async () => {
    try {
      const q = query(collection(db, 'providers'), where('isOnline', '==', true));
      const snapshot = await getCountFromServer(q);
      setProsOnDuty(snapshot.data().count);
    } catch (error) {
      console.error("Failed to fetch pros:", error);
    }
  }, []);

  useEffect(() => {
    fetchRealLocation();
    fetchActivePros();
  }, [fetchRealLocation, fetchActivePros]);

  return { location, prosOnDuty, loading, refetchLocation: fetchRealLocation };
};
