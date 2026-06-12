/**
 * Static-assets Worker for nehoraihadad.com + a tiny vote API.
 *
 * Everything that isn't `/api/*` falls through to the static `dist/` assets
 * (the Astro build) via the ASSETS binding — so the site behaves exactly as the
 * old assets-only Worker did. The extra routes back the v1-vs-v2 character
 * video poll:
 *   GET  /api/votes        -> { v1, v2, s1, s2 }  (votes + exposure counts)
 *   POST /api/vote?v=1|2   -> increments that vote, returns the new tally
 *   POST /api/seen?v=1|2   -> increments that version's exposure counter (the
 *                             landing fires a sendBeacon per version watched,
 *                             so the tally has context from non-voters). 204.
 *
 * Storage is a single KV namespace (binding VOTES): integer keys `v1`/`v2`
 * (votes) and `s1`/`s2` (exposures), plus short-lived `rl:<ip>` rate-limit
 * markers. KV has no atomic increment; at landing-poll traffic a
 * read-modify-write is fine (an occasional lost concurrent increment is
 * acceptable for a vanity counter).
 */

export interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  VOTES: KVNamespace;
}

const KEYS = ["v1", "v2", "s1", "s2"] as const;
type CounterKey = (typeof KEYS)[number];

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Same-origin only in practice; keep it explicit and cache-proof.
      "cache-control": "no-store",
    },
  });

/**
 * Browser-grade same-origin check for the POST endpoints. Evergreen browsers
 * send Sec-Fetch-Site (which page JS cannot fake); older ones still send
 * Origin on POSTs; bare curl sends neither. Not tamper-proof — a scripted
 * client can forge Origin — it just makes inflating a vanity counter cost
 * more than a one-line shell loop.
 */
const isSameOrigin = (request: Request, url: URL): boolean => {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  return request.headers.get("origin") === url.origin;
};

/** ?v=1|2 -> a counter key with the given prefix ("v" votes / "s" seen). */
const keyFor = (url: URL, prefix: "v" | "s"): CounterKey | null => {
  const v = url.searchParams.get("v");
  return v === "1" || v === "2" ? (`${prefix}${v}` as CounterKey) : null;
};

async function bump(env: Env, key: CounterKey): Promise<void> {
  const current = Number((await env.VOTES.get(key)) ?? 0);
  await env.VOTES.put(key, String(current + 1));
}

async function readTally(env: Env): Promise<Record<CounterKey, number>> {
  const entries = await Promise.all(
    KEYS.map(async (k) => [k, Number((await env.VOTES.get(k)) ?? 0)] as const)
  );
  return Object.fromEntries(entries) as Record<CounterKey, number>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/votes" && request.method === "GET") {
      return json(await readTally(env));
    }

    if (url.pathname === "/api/vote" && request.method === "POST") {
      if (!isSameOrigin(request, url)) return json({ error: "forbidden" }, 403);
      const key = keyFor(url, "v");
      if (!key) return json({ error: "v must be 1 or 2" }, 400);
      // One vote per IP per minute (60s = KV's minimum TTL). KV is eventually
      // consistent so a fast burst can slip a few through — fine; the goal is
      // capping abuse loops, not bank-grade accounting. The client already
      // self-locks to one vote per browser via localStorage.
      const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
      if (await env.VOTES.get(`rl:${ip}`)) {
        return json({ error: "too many votes" }, 429);
      }
      await env.VOTES.put(`rl:${ip}`, "1", { expirationTtl: 60 });
      await bump(env, key);
      return json(await readTally(env));
    }

    if (url.pathname === "/api/seen" && request.method === "POST") {
      if (!isSameOrigin(request, url)) return json({ error: "forbidden" }, 403);
      const key = keyFor(url, "s");
      if (!key) return json({ error: "v must be 1 or 2" }, 400);
      await bump(env, key);
      // sendBeacon never reads the response — no body needed.
      return new Response(null, { status: 204 });
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "not found" }, 404);
    }

    // Everything else: serve the static site.
    return env.ASSETS.fetch(request);
  },
};
