'use server';

import { cookies } from 'next/headers';
import { signOut } from '@/auth';
import { isLocale } from '@/lib/i18n/config';
import { ADMIN_LANG_COOKIE } from './lang';

export async function logoutAction() {
  await signOut({ redirectTo: '/admin/login' });
}

// Persist the admin UI language preference. Called from the client toggle; the
// server layout re-reads this cookie on the following render.
export async function setAdminLang(lang: string) {
  if (!isLocale(lang)) return;
  (await cookies()).set(ADMIN_LANG_COOKIE, lang, {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
  });
}
