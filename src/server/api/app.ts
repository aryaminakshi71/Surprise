import { Hono } from 'hono'
import { onError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { BatchHandlerPlugin, RequestHeadersPlugin } from '@orpc/server/plugins'
import { OpenAPIGenerator } from '@orpc/openapi'
import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { SmartCoercionPlugin } from '@orpc/json-schema'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { auth } from '../auth'
import { router } from '../orpc/router'
import { createContext } from '../orpc/context'
import { API_VERSION } from './protocol'
import { cacheMiddleware, rateLimitMiddleware, versionMiddleware } from './middleware'
import { captureError, initSentry } from '../observability/sentry'

const appName =
  process.env.APP_NAME ??
  process.env.VITE_PUBLIC_APP_NAME ??
  'App'

const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
  ],
  plugins: [new BatchHandlerPlugin()],
})

const openAPIHandler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
  ],
  plugins: [
    new RequestHeadersPlugin(),
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
})

const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
})

export const api = new Hono<{ Bindings: Env }>()

initSentry()

api.use('/api/*', versionMiddleware, rateLimitMiddleware)

api.get('/api/health', (c) => {
  return c.json({ ok: true, version: API_VERSION })
})

api.all('/api/auth/*', (c) => auth.handler(c.req.raw))

api.all('/api/rpc/*', async (c) => {
  const { response } = await rpcHandler.handle(c.req.raw, {
    prefix: '/api/rpc',
    context: await createContext(c.req.raw, c.env),
  })

  return response ?? c.text('Not Found', 404)
})

api.get('/api/openapi/spec.json', cacheMiddleware(300), async (c) => {
  const origin = new URL(c.req.url).origin
  const spec = await openAPIGenerator.generate(router, {
    info: {
      title: `${appName} API`,
      version: API_VERSION,
      description: 'Type-safe APIs for ParkingPro',
    },
    servers: [{ url: `${origin}/api/openapi` }],
  })

  return c.json(spec)
})

api.all('/api/openapi/*', async (c) => {
  const { response } = await openAPIHandler.handle(c.req.raw, {
    prefix: '/api/openapi',
    context: await createContext(c.req.raw, c.env),
  })

  return response ?? c.text('Not Found', 404)
})

api.onError((err, c) => {
  captureError(err)
  return c.json({ error: 'internal_error', message: 'Unexpected server error.' }, 500)
})
