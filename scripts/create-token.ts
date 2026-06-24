// CLI helper: mint a new agent API token and print it once to stdout.
//
// Usage:
//   pnpm token:create <owner-email> [label]
//
// The plaintext token is printed exactly once and is never stored. Copy it
// immediately — it cannot be recovered from the database.
//
// NOTE: This script intentionally does NOT import lib/admin/db/queries.ts
// because that module starts with `import 'server-only'`, which throws in a
// plain Node/tsx process (the 'react-server' exports condition that silences it
// is only active inside the Next.js bundler). Instead, the script replicates the
// minimal token-generation and DB-insert logic inline using the same schema and
// Drizzle/Neon packages that queries.ts uses.

// Load .env* (including .env.local) before any database import — same pattern
// as drizzle.config.ts so DATABASE_URL is available outside the Next runtime.
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { randomBytes, createHash } from 'node:crypto';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { apiTokens } from '../lib/admin/db/schema';

// --- args -------------------------------------------------------------------

const owner = process.argv[2];
const label = process.argv[3] ?? 'cli';

if (!owner) {
  console.error('Usage: pnpm token:create <owner-email> [label]');
  process.exit(1);
}

// --- helpers (mirrors queries.ts, no server-only dependency) ----------------

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function generateToken(): { token: string; tokenHash: string; prefix: string } {
  const token = 'nh_' + randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const prefix = token.slice(0, 11);
  return { token, tokenHash, prefix };
}

// --- main -------------------------------------------------------------------

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Error: DATABASE_URL is not set. Add it to .env.local and retry.');
    process.exit(1);
  }

  const db = drizzle(neon(url), { schema: { apiTokens } });
  const { token, tokenHash, prefix } = generateToken();

  const [row] = await db
    .insert(apiTokens)
    .values({ ownerEmail: owner, label, tokenHash, prefix, expiresAt: null })
    .returning({ id: apiTokens.id });

  console.log('');
  console.log('API token created successfully.');
  console.log('');
  console.log(`  Owner : ${owner}`);
  console.log(`  Label : ${label}`);
  console.log(`  ID    : ${row.id}`);
  console.log(`  Prefix: ${prefix}`);
  console.log('');
  console.log('  TOKEN (shown once — copy it now):');
  console.log('');
  console.log(`  ${token}`);
  console.log('');
  console.log('  WARNING: This is the only time the full token will be shown.');
  console.log('  Store it in a secrets manager or environment variable immediately.');
  console.log('');
}

main().catch((err) => {
  console.error('Failed to create token:', err);
  process.exit(1);
});
