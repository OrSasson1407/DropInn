import React, { useState } from 'react';
import { setProviderAvailability } from '../../shared/services/firestore';
import { useAuth } from '../../shared/context/AuthContext';

export default function AvailabilityToggle() {
  const [isAvailable, setIsAvailable] = useState(false);
  const { currentUser } = useAuth();

  const toggle = async () => {
    const newVal = !isAvailable;
    setIsAvailable(newVal);
    if (currentUser) {
      await setProviderAvailability(currentUser.uid, newVal);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>Status: {isAvailable ? '?? Available Now' : '?? Offline'}</h3>
      <button onClick={toggle} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
        Go {isAvailable ? 'Offline' : 'Online'}
      </button>
    </div>
  );
}
