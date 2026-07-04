import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

/**
 * libSQL / SQLite connection.
 * - Local dev: DATABASE_URL="file:local.db"
 * - Production: DATABASE_URL="libsql://<your-app>.fly.dev" (self-hosted sqld on Fly.io)
 *   plus DATABASE_AUTH_TOKEN if the sqld instance requires auth.
 */
const url = process.env.DATABASE_URL ?? 'file:local.db'
const authToken = process.env.DATABASE_AUTH_TOKEN

const client = createClient(authToken ? { url, authToken } : { url })

export const db = drizzle(client, { schema })
export { schema }
