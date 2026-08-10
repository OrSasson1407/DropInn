export const calculateDistance = async (origin, destination) => {
  return new Promise((resolve, reject) => {
    // If the Google Maps script hasn't loaded yet, return a safe fallback
    if (!window.google || !window.google.maps) {
      console.warn("Google Maps not loaded yet, skipping distance calculation.");
      return resolve({ distance: '-- km', time: '-- mins', numericMinutes: 0, numericKm: 0 });
    }

    const service = new window.google.maps.DistanceMatrixService();
    
    service.getDistanceMatrix({
      origins: [origin],
      destinations: [destination],
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (response, status) => {
      if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
        const element = response.rows[0].elements[0];
        resolve({
          distance: element.distance.text,
          time: element.duration.text,
          numericMinutes: Math.round(element.duration.value / 60),
          numericKm: +(element.distance.value / 1000).toFixed(1),
          calculatedKm: +(element.distance.value / 1000).toFixed(1),
          calculatedEta: Math.round(element.duration.value / 60)
        });
      } else {
        console.warn("Distance Matrix failed:", status);
        resolve({ distance: '-- km', time: '-- mins', numericMinutes: 0, numericKm: 0 });
      }
    });
  });
};
