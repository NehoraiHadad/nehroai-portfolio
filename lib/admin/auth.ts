import 'server-only';
import { redirect } from 'next/navigation';
import { auth, isAllowedEmail } from '@/auth';

export interface AdminUser {
  email: string;
  name: string | null;
  image: string | null;
}

/**
 * Data Access Layer guard. Every protected admin page/layout/server action
 * calls this. It is the authoritative check (the proxy cookie gate is only an
 * optimistic redirect): it verifies a real session AND re-validates the email
 * against the allowlist, so a stale/forged cookie or a removed allowlist entry
 * is caught here. Redirects to the login page when access is denied.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const session = await auth();
  const email = session?.user?.email ?? null;

  if (!email || !isAllowedEmail(email)) {
    redirect('/admin/login');
  }

  return {
    email,
    name: session?.user?.name ?? null,
    image: session?.user?.image ?? null,
  };
}

/** Non-redirecting read of the current admin session (or null). */
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await auth();
  const email = session?.user?.email ?? null;
  if (!email || !isAllowedEmail(email)) {
    return null;
  }
  return {
    email,
    name: session?.user?.name ?? null,
    image: session?.user?.image ?? null,
  };
}
