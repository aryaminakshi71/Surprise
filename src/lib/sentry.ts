import * as Sentry from '@sentry/react'

let initialized = false

export function initSentry() {
  if (initialized) return
  const dsn = import.meta.env.VITE_PUBLIC_SENTRY_DSN || import.meta.env.SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  })
  initialized = true
}

export { Sentry }
