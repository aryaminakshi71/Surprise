import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import postgres from 'postgres'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import * as authSchema from './auth-schema'
import * as appSchema from './schema'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

export const schema = {
  ...authSchema,
  ...appSchema,
}

// Detect if we're using local PostgreSQL or Neon
const isLocalPostgres = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')

export const db = isLocalPostgres
  ? drizzlePostgres(postgres(databaseUrl), { schema })
  : drizzleNeon(neon(databaseUrl), { schema })

export type Database = typeof db
