import 'server-only';

// Neon-backed fixed-window rate limiter for the public chat route. Fail-open
// by design: a DB hiccup degrades to "no rate limit" rather than taking the
// assistant down — the real cost ceiling is the provider-side quota.

import { createHash } from 'node:crypto';
import { sql, lt } from 'drizzle-orm';
import { getDb } from '@/lib/admin/db/client';
import { chatRateLimits } from '@/lib/admin/db/schema';

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

export function clientIpHash(req: Request): string {
  // Vercel sets x-real-ip / overwrites x-forwarded-for at the edge, so these
  // are platform-controlled in production (not client-spoofable there).
  const ip =
    req.headers.get('x-real-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  // Salted so stored hashes can't be reversed by enumerating the IPv4 space.
  const salt = process.env.CHAT_RATE_LIMIT_SALT || 'portfolio-chat-v1';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

/** Returns true when the request is allowed. */
export async function checkRateLimit(ipHash: string): Promise<boolean> {
  try {
    const db = getDb();
    const windowStart = new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS);

    const [row] = await db
      .insert(chatRateLimits)
      .values({ ipHash, windowStart, count: 1 })
      .onConflictDoUpdate({
        target: [chatRateLimits.ipHash, chatRateLimits.windowStart],
        set: { count: sql`${chatRateLimits.count} + 1` },
      })
      .returning({ count: chatRateLimits.count });

    if (row.count === 1) {
      // First hit of a fresh window — piggyback pruning of stale windows so
      // the table stays tiny without a scheduled job. Fire-and-forget.
      const cutoff = new Date(Date.now() - 10 * WINDOW_MS);
      db.delete(chatRateLimits)
        .where(lt(chatRateLimits.windowStart, cutoff))
        .catch(() => {});
    }

    return row.count <= MAX_REQUESTS_PER_WINDOW;
  } catch (err) {
    console.error('[portfolio-chat] rate limit check failed (failing open):', err);
    return true;
  }
}
