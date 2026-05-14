import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function createDb() {
  // Try unpooled/clean URLs first — pooled URLs with channel_binding=require break neon-http
  const connectionString = process.env.DATABASE_URL_UNPOOLED
    || process.env.POSTGRES_URL_NON_POOLING
    || process.env.POSTGRES_URL_NO_SSL
    || process.env.DATABASE_URL
    || process.env.POSTGRES_URL
    || process.env.POSTGRES_PRISMA_URL;
  if (!connectionString) {
    console.error('[DB] No connection string found');
    throw new Error('DATABASE_URL environment variable is not set');
  }
  // Strip parameters that break the neon HTTP driver
  const cleanUrl = connectionString.replace(/[?&](channel_binding|sslmode|connect_timeout)=[^&]+/g, '').replace(/[?&]$/, '');
  const client = neon(cleanUrl);
  return drizzle(client, { schema });
}

let _db: ReturnType<typeof drizzle> | null = null;

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    if (!_db) _db = createDb();
    return (_db as any)[prop];
  },
});
