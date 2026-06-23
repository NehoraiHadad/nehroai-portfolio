import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same mechanism). This file
// host-routes the admin app:
//
//   • admin.nehoraihadad.com  → serves ONLY the admin app (internal /admin/*),
//     bare "/" rewrites to the dashboard, and an optimistic auth gate redirects
//     logged-out visitors to /admin/login.
//   • nehoraihadad.com (prod) → the public portfolio is untouched; /admin/* is
//     hidden behind a 404 so the admin app isn't discoverable on the main host.
//   • localhost (dev)         → /admin/* is reachable directly (for smoke
//     testing) with the same optimistic gate.
//
// The gate here is OPTIMISTIC (cookie presence only). The authoritative check —
// real session + allowlist — lives in requireAdmin() (lib/admin/auth.ts), per
// the Next.js auth guidance (no DB/session decode in the proxy).

// Auth.js sets `authjs.session-token` over http (dev) and the `__Secure-`
// prefixed variant over https (prod). Check both.
const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token'];

function hasSessionCookie(req: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => req.cookies.has(name));
}

function redirectTo(req: NextRequest, pathname: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  return NextResponse.redirect(url);
}

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get('host') ?? '').toLowerCase();
  const isAdminHost = host.startsWith('admin.');
  const isLocalDev = host.startsWith('localhost') || host.startsWith('127.0.0.1');

  // NextAuth endpoints always pass through, on every host.
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // --- The admin subdomain: a self-contained admin surface ---
  if (isAdminHost) {
    // Map anything that isn't already under /admin into the admin app.
    if (!pathname.startsWith('/admin')) {
      // Bare root rewrites to the dashboard (keeps the clean URL); any other
      // stray path redirects there.
      if (pathname === '/') {
        const url = req.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.rewrite(url);
      }
      return redirectTo(req, '/admin');
    }
    // Optimistic auth gate.
    if (!pathname.startsWith('/admin/login') && !hasSessionCookie(req)) {
      return redirectTo(req, '/admin/login');
    }
    return NextResponse.next();
  }

  // --- Non-admin host (public site + localhost dev) ---
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (isLocalDev) {
      // Dev convenience: reach the admin app at localhost:3000/admin, same gate.
      if (!pathname.startsWith('/admin/login') && !hasSessionCookie(req)) {
        return redirectTo(req, '/admin/login');
      }
      return NextResponse.next();
    }
    // Production public host: the admin app must not be reachable here. Bounce
    // to the public home (robust — no dependency on a not-found page, and the
    // admin data is independently protected by requireAdmin() regardless).
    return redirectTo(req, '/');
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|woff2?|ttf|txt|xml|json)$).*)',
  ],
};
