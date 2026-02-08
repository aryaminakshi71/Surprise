/// <reference types="vite/client" />

interface Env {
  DATABASE_URL: string
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL?: string
  NODE_ENV?: string
  UPSTASH_REDIS_REST_URL?: string
  UPSTASH_REDIS_REST_TOKEN?: string
  SENTRY_DSN?: string
  SENTRY_ENVIRONMENT?: string
  API_VERSION?: string
}
