import React from 'react';
import { seedInitialDatabase } from '../utils/seedFirebase';

export default function SeedButton() {
  return (
    <button 
      onClick={seedInitialDatabase} 
      style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}
      className="p-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-full shadow-2xl transition-all"
    >
      ⚠️ SEED FIREBASE ⚠️
    </button>
  );
}
