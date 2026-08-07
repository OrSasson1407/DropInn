import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    include: ['src/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}']
  },
  define: {
    'process.env': {
      GOOGLE_MAPS_PLATFORM_KEY: JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || ''),
      REACT_APP_FIREBASE_API_KEY: JSON.stringify(process.env.REACT_APP_FIREBASE_API_KEY || ''),
      REACT_APP_FIREBASE_AUTH_DOMAIN: JSON.stringify(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || ''),
      REACT_APP_FIREBASE_PROJECT_ID: JSON.stringify(process.env.REACT_APP_FIREBASE_PROJECT_ID || ''),
      REACT_APP_FIREBASE_STORAGE_BUCKET: JSON.stringify(process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || ''),
      REACT_APP_FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || ''),
      REACT_APP_FIREBASE_APP_ID: JSON.stringify(process.env.REACT_APP_FIREBASE_APP_ID || ''),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    }
  }
});
