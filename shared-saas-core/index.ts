// @shared/saas-core - Main Entry Point

// Components
export * from './components/ui'
export * from './components/landing'
export * from './components/auth'
export * from './components/compliance'
export * from './components/charts'
export * from './components/ai'
export * from './components/advanced'

// Auth exports (commented out - auth-service requires JWT_SECRET env vars at import time)
// export * from './auth/auth-service'
// export * from './auth/middleware'
// export * from './auth/mfa-service'
// export * from './auth/oauth-service'

// Cache exports (commented out - may have runtime initialization issues)
// export * from './cache/redis-cache'

// Database exports (commented out - server-side only)
// export * from './db/database'
// export * from './db/postgres-connection'
// export * from './db/prisma'

// Hook exports
export * from './hooks/useCommon'
export * from './hooks/useOffline'
export * from './hooks/use-auth'
export * from './hooks/use-compliance'
export * from './hooks/use-tenant'
export * from './hooks/use-continuation'
export * from './hooks/use-optimistic'
export * from './hooks/use-api'
export * from './hooks/use-websocket'
export * from './hooks/use-intersection'
export * from './hooks/use-resize'

// Utils exports
export * from './utils/index'
export * from './utils/validation'
export * from './utils/helpers'
export * from './utils/rate-limit'
export * from './utils/metadata'
export * from './utils/websocket'

// API exports (server-side only - use dynamic imports in client components)
// export * from './api/response' // Commented out - uses NextResponse which is server-only
// export * from './api/swagger'

// Types
export * from './types'

// Compliance (commented out - may have runtime issues)
// export * from './compliance/manager'

// Billing (commented out - server-side only)
// export * from './billing/stripe-service'
// export * from './billing/stripe-config'

// Multi-tenant (commented out - server-side only)
// export * from './multi-tenant/tenant-service'

// Monitoring (commented out - may have runtime initialization)
// export * from './monitoring/sentry'
// export * from './monitoring/sentry-client'

// Analytics
export * from './analytics'

// Middleware (commented out - server-side only)
// export * from './middleware/proxy'

// i18n
export * from './i18n/config'
export * from './i18n/dictionary'
