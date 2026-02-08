import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || 'development';

export function initializeSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    
    tracesSampleRate: 1.0,
    
    profilesSampleRate: 1.0,
    
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    beforeSend(event, hint) {
      const error = hint.originalException;
      
      if (error instanceof Error) {
        if (error.message.includes('ResizeObserver')) {
          return null;
        }
      }
      
      return event;
    },
    
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === 'ui.click') {
        return null;
      }
      return breadcrumb;
    },
  });
}

export function captureError(error: Error, context?: Record<string, any>) {
  if (!SENTRY_DSN) {
    console.error('Error:', error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!SENTRY_DSN) {
    console.log(level, message);
    return;
  }

  Sentry.captureMessage(message, level as any);
}

export function setUserContext(user: { id: string; email?: string; name?: string } | null) {
  if (!SENTRY_DSN) return;

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  } else {
    Sentry.setUser(null);
  }
}

export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, any>
) {
  if (!SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}

export function startTransaction(name: string, op: string) {
  if (!SENTRY_DSN) {
    return {
      finish: () => {},
      setStatus: () => {},
      startChild: () => ({ finish: () => {} }),
    };
  }

  return Sentry.startTransaction({
    name,
    op,
  });
}

export function setTag(key: string, value: string) {
  if (!SENTRY_DSN) return;
  Sentry.setTag(key, value);
}

export function setContext(name: string, context: Record<string, any>) {
  if (!SENTRY_DSN) return;
  Sentry.setContext(name, context);
}

export { Sentry };
