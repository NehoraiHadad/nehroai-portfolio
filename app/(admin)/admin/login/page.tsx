import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { signIn } from '@/auth';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { adminLang } from '../../_components/lang';
import { AdminLangToggle } from '../../_components/AdminLangToggle';
import { ThemeToggle } from '@/app/components/ThemeToggle';

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

export default async function AdminLoginPage({ searchParams }: PageProps<'/admin/login'>) {
  const params = await searchParams;
  const dict = await getDictionary(await adminLang());
  const t = dict.admin.login;
  const denied = params.error === 'AccessDenied';

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute top-4 end-4 flex items-center gap-2">
        <AdminLangToggle />
        <ThemeToggle />
      </div>

      <div className="card w-full max-w-sm p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-[var(--r-2)] bg-accent text-[var(--fg-on-accent)] font-mono text-lg font-bold" aria-hidden="true">
          NH
        </span>
        <h1 className="!mb-1 mt-4 text-[var(--t-24)]">{t.title}</h1>
        <p className="text-sm text-fg-2">{t.subtitle}</p>

        {denied && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-[var(--r-1)] border border-[var(--danger)] bg-[var(--danger-dim)] p-3 text-start text-sm text-[var(--danger)]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>
              <strong className="block font-semibold">{t.deniedTitle}</strong>
              {t.deniedBody}
            </span>
          </div>
        )}

        <form
          className="mt-6"
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/admin' });
          }}
        >
          <button type="submit" className="btn btn-secondary w-full">
            <GoogleIcon />
            {t.googleButton}
          </button>
        </form>

        <Link href="/" className="mt-6 inline-block text-xs text-fg-2 hover:text-fg-0">
          {t.backToSite}
        </Link>
      </div>
    </div>
  );
}
