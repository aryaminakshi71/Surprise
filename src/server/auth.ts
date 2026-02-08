import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { organization } from 'better-auth/plugins'
import { db, schema } from './db'

const baseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.VITE_PUBLIC_SITE_URL ??
  process.env.APP_URL ??
  'http://localhost:3000'

const appName =
  process.env.APP_NAME ??
  process.env.VITE_PUBLIC_APP_NAME ??
  'App'

export const auth = betterAuth({
  appName,
  baseURL,
  basePath: '/api/auth',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
    }),
  ],
  trustedOrigins: [baseURL].filter(Boolean),
})

export type Session = typeof auth.$Infer.Session
export type ActiveOrganization = typeof auth.$Infer.ActiveOrganization
