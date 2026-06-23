import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// Admin access is gated by an explicit allowlist of Google account emails,
// supplied as a comma-separated `ADMIN_EMAILS` env var. There is no public
// sign-up: an authenticated Google user who is not on the list is rejected at
// the `signIn` callback (see below) and never receives a session.
export function getAllowedEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAllowedEmails().includes(email.toLowerCase());
}

// Auth.js v5 (NextAuth beta). The Google provider auto-reads `AUTH_GOOGLE_ID`
// and `AUTH_GOOGLE_SECRET` from the environment by convention. `trustHost` is
// required because the app is served from a custom subdomain behind a proxy
// (admin.nehoraihadad.com) — without it NextAuth refuses the host header.
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [Google],
  pages: {
    // Both the sign-in prompt and the access-denied error route here. The login
    // page reads `?error=AccessDenied` to explain a rejected (non-allowlisted)
    // account. Path is the internal /admin/login (proxy maps the subdomain).
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    // Allowlist enforcement #1 (authoritative at the auth layer): a Google
    // account that is not in ADMIN_EMAILS is denied a session entirely.
    // requireAdmin() in lib/admin/auth.ts re-checks per request (defense in depth).
    signIn({ user }) {
      return isAllowedEmail(user.email);
    },
  },
});
