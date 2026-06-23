import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';

// Load .env* the same way Next.js does, so drizzle-kit (run outside the Next
// runtime) sees DATABASE_URL from .env.local. Documented pattern:
// node_modules/next/dist/docs/01-app/02-guides/environment-variables.md
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: './lib/admin/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Prefer the direct (unpooled) connection for DDL — pgbouncer can choke on
    // migration statements. Falls back to the pooled URL if unpooled isn't set.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? '',
  },
});
