import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const raw = process.env.MEDNEST_DATABASE_URL
  || process.env.DATABASE_URL
  || process.env.POSTGRES_URL
  || process.env.DATABASE_URL_UNPOOLED
  || process.env.POSTGRES_URL_NON_POOLING;
if (!raw) throw new Error('DATABASE_URL environment variable is not set');

const clean = raw.replace(/-pooler\./g, '.').split('?')[0];
const sql = neon(clean);

export const db = drizzle(sql, { schema });
