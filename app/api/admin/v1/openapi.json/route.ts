export const runtime = 'nodejs';

// Public — no auth required. The OpenAPI spec is a contract, not a secret.
// Agents and tooling fetch this to discover available operations and schemas.

import { buildOpenApiDocument } from '../_lib/openapi';

export async function GET(req: Request): Promise<Response> {
  const origin = new URL(req.url).origin;
  const doc = buildOpenApiDocument(origin);
  return Response.json(doc, {
    headers: {
      // Allow short-lived caching of the spec — it only changes on deploy.
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    },
  });
}
