import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function createDb() {
  const connectionString = process.env.DATABASE_URL
    || process.env.POSTGRES_URL
    || process.env.DATABASE_URL_UNPOOLED
    || process.env.POSTGRES_URL_NON_POOLING
    || process.env.POSTGRES_URL_NO_SSL;
  if (!connectionString) {
    console.error('[DB] No connection string found. Checked: DATABASE_URL, POSTGRES_URL, DATABASE_URL_UNPOOLED, POSTGRES_URL_NON_POOLING, POSTGRES_URL_NO_SSL');
    throw new Error('DATABASE_URL environment variable is not set');
  }
  // Log which env var was found (first 20 chars only)
  const source = connectionString === process.env.DATABASE_URL ? 'DATABASE_URL'
    : connectionString === process.env.POSTGRES_URL ? 'POSTGRES_URL'
    : connectionString === process.env.DATABASE_URL_UNPOOLED ? 'DATABASE_URL_UNPOOLED'
    : connectionString === process.env.POSTGRES_URL_NON_POOLING ? 'POSTGRES_URL_NON_POOLING'
    : 'POSTGRES_URL_NO_SSL';
  console.log(`[DB] Using ${source}: ${connectionString.substring(0, 25)}...`);
  const client = neon(connectionString);
  return drizzle(client, { schema });
}

let _db: ReturnType<typeof drizzle> | null = null;

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    if (!_db) _db = createDb();
    return (_db as any)[prop];
  },
});
