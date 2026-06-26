import 'server-only';

// Builds the public approval URL for a quote share token. Centralized so the
// admin Server Action, the agent HTTP route, and the MCP tool produce identical
// links — all pointing at the PUBLIC app origin where /q/<token> is served.

/**
 * Resolves the origin for client-facing share links.
 *
 * Share links MUST point at the public app host (where the /q/<token> approval
 * page is served), never the admin subdomain — `proxy.ts` redirects every
 * non-/admin path on admin.* straight to the dashboard, so an admin-host share
 * link is dead on arrival. Because the same app answers on multiple hosts
 * (admin.* for the gated UI, the public host for everything else), the request
 * host is NOT a reliable source for these links.
 *
 * Source of truth is the `PUBLIC_APP_ORIGIN` env var (e.g.
 * "https://ai.nehoraihadad.com"). The request-derived origin is used only as a
 * dev fallback when the var is unset (so localhost just works). Returns null
 * when neither is available, letting the caller decide how to degrade.
 */
export function resolveShareOrigin(fallbackOrigin?: string | null): string | null {
  const configured = process.env.PUBLIC_APP_ORIGIN?.trim();
  if (configured) return configured.replace(/\/$/, '');
  const fallback = fallbackOrigin?.trim();
  return fallback ? fallback.replace(/\/$/, '') : null;
}

/** `<origin>/q/<token>`, with any trailing slash on origin stripped. */
export function buildShareUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, '')}/q/${token}`;
}
