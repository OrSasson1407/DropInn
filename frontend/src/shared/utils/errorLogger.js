/**
 * Sentry-compatible / Centralized Error Logging & Diagnostics Service
 */

class ErrorLogger {
  constructor() {
    this.sentryDsn = typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_SENTRY_DSN
      : process.env.SENTRY_DSN || null;
    
    this.logs = [];
    this.initGlobalHandlers();
  }

  initGlobalHandlers() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureException(event.error || new Error(event.message), {
          context: 'uncaught_window_error',
          filename: event.filename,
          lineno: event.lineno
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.captureException(event.reason || new Error('Unhandled Promise Rejection'), {
          context: 'unhandled_promise_rejection'
        });
      });
    }
  }

  captureException(error, extraContext = {}) {
    const errorObj = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      timestamp: new Date().toISOString(),
      extra: extraContext
    };

    this.logs.unshift(errorObj);
    if (this.logs.length > 50) this.logs.pop();

    if (process.env.NODE_ENV !== 'test') {
      console.error('[DropIn ErrorLogger Captured]:', errorObj.message, extraContext);
    }

    if (this.sentryDsn && typeof window !== 'undefined' && window.Sentry) {
      try {
        window.Sentry.captureException(error, { extra: extraContext });
      } catch (e) {
        // Fallback
      }
    }
  }

  getLogs() {
    return this.logs;
  }
}

export const errorLogger = new ErrorLogger();
