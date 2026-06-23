import 'server-only';
import { cookies } from 'next/headers';
import { isLocale, defaultLocale, type AppLocale } from '@/lib/i18n/config';

// Server-side read of the admin locale preference. The matching cookie write
// lives in AdminLangToggle (client) — keep the name in sync.
export const ADMIN_LANG_COOKIE = 'admin_lang';

export async function adminLang(): Promise<AppLocale> {
  const raw = (await cookies()).get(ADMIN_LANG_COOKIE)?.value;
  return raw && isLocale(raw) ? raw : defaultLocale;
}
