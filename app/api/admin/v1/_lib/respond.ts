// Shared helpers for the agent-facing v1 API. Unlike the admin-only session
// routes, agent routes must NOT leak stack traces — all errors that reach the
// client are sanitised through apiError(); internals go to console.error only.

import { requireAgent } from '@/lib/admin/agent-auth';
import type { AgentIdentity } from '@/lib/admin/agent-auth';
import type { ZodError } from 'zod';

// ---- Base response wrappers -------------------------------------------------

/** Wrap any JSON value as a no-store response. Extra init fields are merged in. */
export function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...init?.headers,
    },
  });
}

type ApiErrorCode = 'unauthorized' | 'not_found' | 'validation_error' | 'internal';

/** Stable-code error envelope — the only shape agents can rely on for errors. */
export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): Response {
  const body: { error: { code: string; message: string; details?: unknown } } = {
    error: { code, message },
  };
  if (details !== undefined) body.error.details = details;
  return json(body, { status });
}

// ---- Specific error helpers --------------------------------------------------

/** 401 with WWW-Authenticate: Bearer header. */
export function unauthorized(): Response {
  const res = apiError(401, 'unauthorized', 'Valid bearer token required.');
  res.headers.set('WWW-Authenticate', 'Bearer');
  return res;
}

export function notFound(message = 'Resource not found.'): Response {
  return apiError(404, 'not_found', message);
}

/** Flatten Zod issues into a details array and return 400. */
export function validationError(err: ZodError): Response {
  const details = err.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
  return apiError(400, 'validation_error', 'Request body failed validation.', details);
}

/** 500 — log the real error server-side, return a generic message to the agent. */
export function internal(cause?: unknown): Response {
  if (cause !== undefined) {
    console.error('[v1 api] internal error:', cause);
  }
  return apiError(500, 'internal', 'An unexpected error occurred.');
}

// ---- Auth guard -------------------------------------------------------------

/**
 * Resolve the bearer token from `req`. On success returns the AgentIdentity so
 * the route can extract `ownerEmail`. On failure returns a 401 Response — routes
 * must check `if (id instanceof Response) return id;` before proceeding.
 */
export async function authed(req: Request): Promise<AgentIdentity | Response> {
  const identity = await requireAgent(req);
  if (!identity) return unauthorized();
  return identity;
}
