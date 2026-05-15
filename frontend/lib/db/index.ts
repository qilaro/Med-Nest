import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

function cleanEnv(value?: string) {
  if (!value) return '';
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function buildUrlFromParts() {
  const host = cleanEnv(process.env.PGHOST || process.env.POSTGRES_HOST || process.env.PGHOST_UNPOOLED);
  const database = cleanEnv(process.env.PGDATABASE || process.env.POSTGRES_DATABASE);
  const user = cleanEnv(process.env.PGUSER || process.env.POSTGRES_USER);
  const password = cleanEnv(process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD);
  if (!host || !database || !user || !password) return '';
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${database}?sslmode=require`;
}

function normalizeConnectionString(raw: string) {
  const value = cleanEnv(raw);
  if (!value) return '';
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') return '';
    if (!parsed.searchParams.get('sslmode')) parsed.searchParams.set('sslmode', 'require');
    return parsed.toString();
  } catch {
    return '';
  }
}

function resolveConnectionString() {
  // Prefer pooled URLs on serverless first.
  const candidates = [
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_PRISMA_URL,
    buildUrlFromParts(),
  ];
  for (const raw of candidates) {
    const normalized = raw ? normalizeConnectionString(raw) : '';
    if (normalized) return normalized;
  }
  return '';
}

type DbClient = ReturnType<typeof drizzle>;

declare global {
  // eslint-disable-next-line no-var
  var __mednestPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __mednestDb: DbClient | undefined;
}

function createDb() {
  const connectionString = resolveConnectionString();
  if (!connectionString) {
    console.error('[DB] No valid connection string found');
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const pool = globalThis.__mednestPool ?? new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  });
  if (!globalThis.__mednestPool) globalThis.__mednestPool = pool;
  return drizzle(pool, { schema });
}

let _db: DbClient | null = globalThis.__mednestDb ?? null;

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    if (!_db) {
      _db = createDb();
      globalThis.__mednestDb = _db;
    }
    return (_db as any)[prop];
  },
});
