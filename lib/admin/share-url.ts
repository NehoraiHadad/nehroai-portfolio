import 'server-only';

// Builds the public approval URL for a quote share token. Centralized so the
// admin Server Action and the agent HTTP route produce identical links.

/** `<origin>/q/<token>`, with any trailing slash on origin stripped. */
export function buildShareUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, '')}/q/${token}`;
}
