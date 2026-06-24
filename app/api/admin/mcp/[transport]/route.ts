// In-process MCP server for the nehroai-admin tools (quotes + brand).
//
// Transport routing: mcp-handler requires a [transport] dynamic segment when
// basePath is set. With basePath='/api/admin/mcp' the streamable-HTTP endpoint
// resolves to /api/admin/mcp/mcp — that is the URL MCP clients should connect to.
// (Pattern: basePath + '/mcp' → [transport] = 'mcp'.)
//
// Auth: withMcpAuth wraps the handler and extracts the bearer token from the
// Authorization header. resolveOwnerFromToken validates it against the DB and
// populates req.auth / extra.authInfo, which the tool handlers read via ownerOf().
//
// Connect URL: <origin>/api/admin/mcp/mcp

import { createMcpHandler, withMcpAuth, getPublicOrigin } from 'mcp-handler';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';

import { resolveOwnerFromToken } from '@/lib/admin/agent-auth';
import { registerQuoteTools } from '@/lib/admin/mcp-tools';

export const runtime = 'nodejs';
// Match the PDF route ceiling — tools like get_quote_pdf launch Chromium.
export const maxDuration = 300;

const handler = createMcpHandler(
  (server) => {
    registerQuoteTools(server);
  },
  { serverInfo: { name: 'nehroai-admin', version: '1.0.0' } },
  { basePath: '/api/admin/mcp', maxDuration: 300, disableSse: true },
);

async function verifyToken(
  req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;
  const identity = await resolveOwnerFromToken(bearerToken);
  if (!identity) return undefined;
  // Capture the public-facing origin here (respects X-Forwarded-* proxy headers,
  // so it's correct on Vercel too) and stash it in authInfo — the tool handlers
  // don't receive the raw Request, so get_quote_pdf reads the origin from extra.
  const origin = getPublicOrigin(req);
  return {
    token: bearerToken,
    clientId: identity.tokenId,
    scopes: [],
    extra: { ownerEmail: identity.ownerEmail, origin },
  };
}

const authed = withMcpAuth(handler, verifyToken, { required: true });
export { authed as GET, authed as POST, authed as DELETE };
