// Non-interactive (agent/machine) auth path — the bearer-token analogue of
// lib/admin/auth.ts. Where requireAdmin() checks a session cookie and redirects
// on failure, this module inspects an Authorization: Bearer <token> header,
// hashes the token, and resolves the owning admin from the database. It never
// redirects — callers are responsible for returning the appropriate HTTP response
// (typically 401) when null is returned. Designed for API routes that agents
// call programmatically rather than users visiting in a browser.
import 'server-only';
import { hashToken, findActiveTokenByHash, touchTokenLastUsed } from './db/queries';

export interface AgentIdentity {
  ownerEmail: string;
  tokenId: string;
}

/**
 * Resolve an AgentIdentity from a raw bearer token string. Returns null if the
 * token is missing, malformed, revoked, or expired. On success, fires a
 * last-used timestamp update in the background (not awaited — a failure there
 * must never block or crash the request).
 */
export async function resolveOwnerFromToken(token: string): Promise<AgentIdentity | null> {
  if (!token) return null;
  const hash = hashToken(token);
  const row = await findActiveTokenByHash(hash);
  if (!row) return null;
  void touchTokenLastUsed(row.id).catch(() => {});
  return { ownerEmail: row.ownerEmail, tokenId: row.id };
}

/**
 * Extract and validate the bearer token from a Request's Authorization header.
 * Returns null when the header is absent or does not start with "Bearer "
 * (case-insensitive). Delegates to resolveOwnerFromToken for DB validation.
 */
export async function requireAgent(req: Request): Promise<AgentIdentity | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  if (!authHeader.toLowerCase().startsWith('bearer ')) return null;
  const token = authHeader.slice('bearer '.length).trim();
  return resolveOwnerFromToken(token);
}
