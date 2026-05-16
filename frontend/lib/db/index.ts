import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// Order: prefer unpooled, fallback to pooled with -pooler stripped
const raw = process.env.DATABASE_URL_UNPOOLED
  || process.env.POSTGRES_URL_NON_POOLING
  || process.env.POSTGRES_URL_NO_SSL
  || process.env.DATABASE_URL
  || process.env.POSTGRES_URL;
if (!raw) throw new Error('DATABASE_URL environment variable is not set');

// Strip -pooler and all query params — Pool handles TLS natively
const clean = raw.replace(/-pooler\./g, '.').split('?')[0];
const pool = new Pool({ connectionString: clean, max: 2 });

export const db = drizzle(pool, { schema });
