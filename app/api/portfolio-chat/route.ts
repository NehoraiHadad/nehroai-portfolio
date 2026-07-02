export const runtime = 'nodejs';

// Public portfolio chat — bounded LLM Q&A over approved public knowledge only.
// No auth (public visitors), so the guards are: zod validation, size limits,
// Neon-backed rate limiting, a capped completion, and a knowledge base that
// contains nothing private by construction. See AI_PORTFOLIO_AGENT_PLAN.md.

import { z } from 'zod';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { retrieve } from '@/lib/portfolio-agent/retrieve';
import { buildSystemPrompt } from '@/lib/portfolio-agent/prompt';
import { checkRateLimit, clientIpHash } from '@/lib/portfolio-agent/rate-limit';

const MESSAGE_WINDOW = 10;
const MAX_TOTAL_CHARS = 20_000;

const zChatRequest = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(8_000),
      }),
    )
    .min(1)
    .max(40),
  locale: z.enum(['en', 'he']).default('en'),
});

// Same envelope shape as app/api/admin/v1/_lib/respond.ts, kept local — the
// admin helper pulls in agent auth, which this public route must not touch.
type ErrorCode = 'validation_error' | 'rate_limited' | 'unavailable' | 'internal';

function apiError(status: number, code: ErrorCode, message: string, details?: unknown): Response {
  const body: { error: { code: string; message: string; details?: unknown } } = {
    error: { code, message },
  };
  if (details !== undefined) body.error.details = details;
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request): Promise<Response> {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError(400, 'validation_error', 'Request body must be valid JSON.');
    }

    const parsed = zChatRequest.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return apiError(400, 'validation_error', 'Request body failed validation.', details);
    }

    const messages = parsed.data.messages.slice(-MESSAGE_WINDOW);
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
    if (totalChars > MAX_TOTAL_CHARS) {
      return apiError(400, 'validation_error', 'Conversation is too long.');
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      return apiError(400, 'validation_error', 'The last message must be from the user.');
    }

    if (!(await checkRateLimit(clientIpHash(req)))) {
      return apiError(429, 'rate_limited', 'Too many requests — please wait a moment.');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return apiError(503, 'unavailable', 'The assistant is not available right now.');
    }

    const context = retrieve(lastMessage.content, parsed.data.locale);
    const system = buildSystemPrompt(context, parsed.data.locale);

    const google = createGoogleGenerativeAI({ apiKey });
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system,
      messages,
      maxOutputTokens: 1024,
    });

    return result.toTextStreamResponse({ headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[portfolio-chat] internal error:', err);
    return apiError(500, 'internal', 'An unexpected error occurred.');
  }
}
