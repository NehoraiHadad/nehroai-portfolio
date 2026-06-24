export const runtime = 'nodejs';

// Public — no auth required. The skill guide is documentation, not a secret.
// Agents fetch this to self-install the nehroai-admin skill.

import { SKILL_NAME, SKILL_DESCRIPTION, SKILL_MARKDOWN } from '@/lib/admin/skill-guide';
import { json } from '../_lib/respond';

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const format = url.searchParams.get('format');

  if (format === 'json') {
    return json({ name: SKILL_NAME, description: SKILL_DESCRIPTION, markdown: SKILL_MARKDOWN });
  }

  // Default: return raw Markdown with appropriate content headers.
  return new Response(SKILL_MARKDOWN, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Disposition': 'inline; filename="SKILL.md"',
    },
  });
}
