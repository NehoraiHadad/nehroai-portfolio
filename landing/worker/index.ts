/**
 * Static-assets Worker for nehoraihadad.com + a tiny vote API.
 *
 * Everything that isn't `/api/*` falls through to the static `dist/` assets
 * (the Astro build) via the ASSETS binding — so the site behaves exactly as the
 * old assets-only Worker did. The two extra routes back the v1-vs-v2 character
 * video poll:
 *   GET  /api/votes        -> { v1: number, v2: number }
 *   POST /api/vote?v=1|2   -> increments that counter, returns the new tally
 *
 * Storage is a single KV namespace (binding VOTES) with two integer keys
 * `v1` / `v2`. KV has no atomic increment; at landing-poll traffic a
 * read-modify-write is fine (an occasional lost concurrent increment is
 * acceptable for a vanity counter).
 */

export interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  VOTES: KVNamespace;
}

const KEYS = ["v1", "v2"] as const;
type VoteKey = (typeof KEYS)[number];

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Same-origin only in practice; keep it explicit and cache-proof.
      "cache-control": "no-store",
    },
  });

async function readTally(env: Env): Promise<Record<VoteKey, number>> {
  const entries = await Promise.all(
    KEYS.map(async (k) => [k, Number((await env.VOTES.get(k)) ?? 0)] as const)
  );
  return Object.fromEntries(entries) as Record<VoteKey, number>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/votes" && request.method === "GET") {
      return json(await readTally(env));
    }

    if (url.pathname === "/api/vote" && request.method === "POST") {
      const v = url.searchParams.get("v");
      const key = (v === "1" ? "v1" : v === "2" ? "v2" : null) as VoteKey | null;
      if (!key) return json({ error: "v must be 1 or 2" }, 400);
      const current = Number((await env.VOTES.get(key)) ?? 0);
      await env.VOTES.put(key, String(current + 1));
      return json(await readTally(env));
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "not found" }, 404);
    }

    // Everything else: serve the static site.
    return env.ASSETS.fetch(request);
  },
};
