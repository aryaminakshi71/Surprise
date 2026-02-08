import type { MiddlewareHandler } from 'hono'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { API_VERSION, API_VERSION_HEADER } from './protocol'

const rateLimit = (() => {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const redis = new Redis({ url, token })
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, '1 m'),
  })
})()

export const versionMiddleware: MiddlewareHandler = async (c, next) => {
  const requestedVersion = c.req.header(API_VERSION_HEADER)
  if (requestedVersion && requestedVersion !== API_VERSION) {
    return c.json(
      {
        error: 'version_mismatch',
        message: `API version mismatch. Server=${API_VERSION} Client=${requestedVersion}`,
        serverVersion: API_VERSION,
        clientVersion: requestedVersion,
      },
      426,
    )
  }

  await next()
  c.header(API_VERSION_HEADER, API_VERSION)
}

export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  if (!rateLimit) return next()

  const ip =
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    'global'

  const result = await rateLimit.limit(ip)
  c.header('x-ratelimit-limit', String(result.limit))
  c.header('x-ratelimit-remaining', String(result.remaining))
  c.header('x-ratelimit-reset', String(result.reset))

  if (!result.success) {
    return c.json(
      {
        error: 'rate_limited',
        message: 'Too many requests. Try again soon.',
      },
      429,
    )
  }

  await next()
}

export function cacheMiddleware(ttlSeconds = 60): MiddlewareHandler {
  return async (c, next) => {
    if (c.req.method !== 'GET') {
      return next()
    }

    const cache = caches.default
    const cacheKey = new Request(c.req.url, c.req.raw)
    const cached = await cache.match(cacheKey)
    if (cached) {
      return cached
    }

    await next()

    if (c.res && c.res.ok) {
      const response = new Response(c.res.body, c.res)
      response.headers.set('Cache-Control', `public, max-age=${ttlSeconds}`)
      await cache.put(cacheKey, response.clone())
      return response
    }

    return c.res
  }
}
