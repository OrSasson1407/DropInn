import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env?.VITE_SENTRY_DSN;

export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] VITE_SENTRY_DSN is not set - error tracking disabled.');
    return;
  }
  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env?.MODE || 'production',
      beforeSend(event) {
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
        }
        return event;
      }
    });
    console.log('[Sentry] Error tracking and tracing initialized.');
  } catch (err) {
    console.warn('[Sentry] Initialization warning:', err.message);
  }
};

export const captureException = (error, context = {}) => {
  console.error('[Sentry Captured Exception]:', error, context);
  if (!SENTRY_DSN) return;
  try {
    Sentry.withScope((scope) => {
      if (context.tags) scope.setTags(context.tags);
      if (context.extra) scope.setExtras(context.extra);
      Sentry.captureException(error);
    });
  } catch (e) {
    // Fallback error log
  }
};

export const captureMessage = (message, level = 'info', extra = {}) => {
  if (!SENTRY_DSN) {
    console.log(`[Sentry Message - ${level}]:`, message, extra);
    return;
  }
  try {
    Sentry.withScope((scope) => {
      scope.setExtras(extra);
      Sentry.captureMessage(message, level);
    });
  } catch (e) {
    console.log(`[Sentry Message - ${level}]:`, message, extra);
  }
};

export const setUserContext = (user) => {
  if (!SENTRY_DSN) return;
  try {
    if (user) {
      Sentry.setUser({
        id: user.uid,
        email: user.email,
        role: user.role || 'customer'
      });
    } else {
      Sentry.setUser(null);
    }
  } catch (e) {
    // Fallback
  }
};

export const SentryErrorBoundary = Sentry.ErrorBoundary;