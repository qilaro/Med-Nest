import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

function createDb() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED
    || process.env.POSTGRES_URL_NON_POOLING
    || process.env.POSTGRES_URL_NO_SSL
    || process.env.DATABASE_URL
    || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}

let _db: ReturnType<typeof drizzle> | null = null;

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    if (!_db) _db = createDb();
    return (_db as any)[prop];
  },
});
