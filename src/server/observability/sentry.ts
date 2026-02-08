import * as Sentry from '@sentry/node'

let initialized = false

export function initSentry() {
  if (initialized) return
  const dsn = process.env.SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? 'development',
  })
  initialized = true
}

export function captureError(error: unknown) {
  if (!process.env.SENTRY_DSN) return
  try {
    Sentry.captureException(error)
  } catch (err) {
    console.error('Failed to send error to Sentry', err)
  }
}
