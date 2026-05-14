import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function createDb() {
  const connectionString = process.env.DATABASE_URL
    || process.env.POSTGRES_URL
    || process.env.DATABASE_URL_UNPOOLED
    || process.env.POSTGRES_URL_NON_POOLING;
  if (!connectionString) {
    console.error('[DB] No connection string found. Checked: DATABASE_URL, POSTGRES_URL, DATABASE_URL_UNPOOLED, POSTGRES_URL_NON_POOLING');
    throw new Error('DATABASE_URL environment variable is not set');
  }
  console.log('[DB] Connecting with:', connectionString.substring(0, 30) + '...');
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
