import React from 'react';
import { seedInitialDatabase } from '../utils/seedFirebase';
import { useAuth } from '../context/AuthContext';

export default function SeedButton() {
  const { isAdmin } = useAuth();

  // Safety: this writes real data to Firestore (categories, loyalty tiers,
  // a test provider). It must never be reachable by a signed-out visitor or
  // a regular customer/provider account.
  if (!isAdmin) return null;

  const handleClick = () => {
    const confirmed = window.confirm(
      'This will seed/overwrite initial Firestore data (categories, loyalty tiers, test provider). Continue?'
    );
    if (confirmed) {
      seedInitialDatabase();
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}
      className="p-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-full shadow-2xl transition-all"
      title="Admin only: seed initial Firestore data"
    >
      ⚠️ SEED FIREBASE ⚠️
    </button>
  );
}
