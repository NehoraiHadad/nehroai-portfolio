// CLI helper: revoke an agent API token by id or prefix.
//
// Usage:
//   pnpm token:revoke <token-id-or-prefix>
//
// Revoking sets `revoked_at` so the token can no longer authenticate; the row is
// kept for audit. Accepts either the full token id (UUID, shown at creation) or
// the display prefix (e.g. "nh_AbCd1234"). The plaintext token itself is never
// stored, so it cannot be used here — identify the token by id or prefix.
//
// NOTE: like create-token.ts, this script does NOT import lib/admin/db/queries.ts
// (that module starts with `import 'server-only'`, which throws outside the
// Next.js bundler). It replicates the minimal owner-agnostic revoke using the
// same schema and Drizzle/Neon packages.

import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { eq, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { apiTokens } from '../lib/admin/db/schema';

const idOrPrefix = process.argv[2];

if (!idOrPrefix) {
  console.error('Usage: pnpm token:revoke <token-id-or-prefix>');
  process.exit(1);
}

// A token id is a UUID; anything else is treated as a display prefix.
const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrPrefix);

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Error: DATABASE_URL is not set. Add it to .env.local and retry.');
    process.exit(1);
  }

  const db = drizzle(neon(url), { schema: { apiTokens } });

  const match = isUuid
    ? eq(apiTokens.id, idOrPrefix)
    : or(eq(apiTokens.prefix, idOrPrefix), eq(apiTokens.id, idOrPrefix));

  const revoked = await db
    .update(apiTokens)
    .set({ revokedAt: new Date() })
    .where(match)
    .returning({ id: apiTokens.id, label: apiTokens.label, prefix: apiTokens.prefix });

  if (revoked.length === 0) {
    console.error(`No token found matching "${idOrPrefix}".`);
    process.exit(1);
  }

  console.log('');
  console.log(`Revoked ${revoked.length} token${revoked.length === 1 ? '' : 's'}:`);
  for (const t of revoked) {
    console.log(`  ${t.prefix}  (id ${t.id})  ${t.label ? `"${t.label}"` : ''}`);
  }
  console.log('');
}

main().catch((err) => {
  console.error('Failed to revoke token:', err);
  process.exit(1);
});
