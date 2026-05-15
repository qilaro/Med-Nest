import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

function createDb() {
  const raw = process.env.DATABASE_URL_UNPOOLED
    || process.env.POSTGRES_URL_NON_POOLING
    || process.env.POSTGRES_URL_NO_SSL
    || process.env.DATABASE_URL
    || process.env.POSTGRES_URL;
  if (!raw) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  // Strip -pooler from hostname to bypass pgBouncer (which breaks GROUP BY / SUM etc.)
  // Also strip incompatible query params
  const clean = raw
    .replace(/-pooler\./g, '.')
    .replace(/[?&](channel_binding|connect_timeout)=[^&]+/g, '')
    .replace(/[?&]$/, '');
  const pool = new Pool({ connectionString: clean });
  return drizzle(pool, { schema });
}

let _db: ReturnType<typeof drizzle> | null = null;

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    if (!_db) _db = createDb();
    return (_db as any)[prop];
  },
});
