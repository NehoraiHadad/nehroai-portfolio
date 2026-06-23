import 'server-only';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Lazy, server-only Drizzle client over the Neon HTTP driver. The connection is
// created on first use (not at module load) so the app can be built and
// type-checked without DATABASE_URL present — the env is only required at
// request time, when an admin actually reads/writes data.

type Db = ReturnType<typeof drizzle<typeof schema>>;

let cached: Db | null = null;

export function getDb(): Db {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set — the admin database is unavailable.');
  }
  cached = drizzle(neon(url), { schema });
  return cached;
}
