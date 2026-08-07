import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  CheckCircle2, AlertCircle, XCircle, Info, X, Sparkles, Bell 
} from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'success', duration = 4500 }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    const newToast = { id, title, message, type, duration };
    
    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toast = {
    success: (message, title = 'Success!') => addToast({ title, message, type: 'success' }),
    error: (message, title = 'Error') => addToast({ title, message, type: 'error' }),
    info: (message, title = 'Notice') => addToast({ title, message, type: 'info' }),
    warning: (message, title = 'Warning') => addToast({ title, message, type: 'warning' }),
    custom: addToast,
    dismiss: removeToast
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toast }}>
      {children}
      {/* Floating Toast Notification Container */}
      <div 
        aria-live="polite" 
        className="fixed top-20 right-4 sm:right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Provide safe noop fallback for component tests without ToastProvider
    return {
      addToast: () => {},
      removeToast: () => {},
      toast: {
        success: console.log,
        error: console.error,
        info: console.log,
        warning: console.warn,
        custom: () => {},
        dismiss: () => {}
      }
    };
  }
  return context;
}

function ToastItem({ toast, onClose }) {
  const { title, message, type, duration } = toast;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-slate-900/95 border-emerald-500/40 shadow-emerald-500/10',
          iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          Icon: CheckCircle2,
          progressColor: 'bg-emerald-500',
          accent: 'text-emerald-400'
        };
      case 'error':
        return {
          bg: 'bg-slate-900/95 border-rose-500/40 shadow-rose-500/10',
          iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          Icon: XCircle,
          progressColor: 'bg-rose-500',
          accent: 'text-rose-400'
        };
      case 'warning':
        return {
          bg: 'bg-slate-900/95 border-amber-500/40 shadow-amber-500/10',
          iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          Icon: AlertCircle,
          progressColor: 'bg-amber-500',
          accent: 'text-amber-400'
        };
      case 'info':
      default:
        return {
          bg: 'bg-slate-900/95 border-blue-500/40 shadow-blue-500/10',
          iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          Icon: Sparkles,
          progressColor: 'bg-blue-500',
          accent: 'text-blue-400'
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = styles.Icon;

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-slideInRight ${styles.bg}`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${styles.iconBg}`}>
          <IconComponent className="w-5 h-5 stroke-[2.5]" />
        </div>

        <div className="flex-1 space-y-0.5 pt-0.5 pr-2">
          {title && (
            <h4 className={`text-xs font-black uppercase tracking-wider ${styles.accent}`}>
              {title}
            </h4>
          )}
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar Timer Animation */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <div 
            className={`h-full ${styles.progressColor} transition-all ease-linear`}
            style={{
              animation: `toastProgress ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
}
