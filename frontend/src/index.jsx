import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import App from './App';
import { AuthProvider } from './shared/context/AuthContext';
import { ToastProvider } from './shared/context/ToastContext';
import { ThemeProvider } from './shared/context/ThemeContext';
import { initSentry, SentryErrorBoundary } from './shared/services/sentry';
import './index.css';

// Initialize Sentry Production Error & Performance Tracing
initSentry();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={<div className="p-8 text-center text-white bg-slate-900 font-sans">An unexpected application error occurred. Sentry error report logged.</div>}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </SentryErrorBoundary>
  </React.StrictMode>
);

