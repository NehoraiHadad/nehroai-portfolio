'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { m, AnimatePresence } from 'motion/react';
import { Briefcase, Menu, X } from 'lucide-react';
import { locales } from '@/lib/i18n/config';
import { useDictionary, useLocale } from '@/lib/i18n/provider';
import { ThemeToggle } from './ThemeToggle';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { TIMELINE } from '@/lib/choreography';

export const TopNav = ({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean, setMobileMenuOpen: (v: boolean) => void }) => {
  const prefersReduced = usePrefersReducedMotion();
  const [dotIgnited, setDotIgnited] = useState(false);
  const { navigation, a11y } = useDictionary();
  const locale = useLocale();
  const localeLabels: Record<(typeof locales)[number], string> = {
    en: 'EN',
    he: 'עב',
  };

  // 4.1: focus trap for mobile menu dialog; restore focus to hamburger button on close
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelId = 'mobile-nav-panel';
  const mobileTrapRef = useFocusTrap<HTMLDivElement>({
    active: mobileMenuOpen,
    restoreRef: menuButtonRef,
  });

  useEffect(() => {
    // 2.1: Skip ignition delay for reduced-motion users — dot appears immediately
    if (prefersReduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDotIgnited(true);
      return;
    }
    // Dot ignites after neon "ai" ignition stabilizes (~3.5s end + 0.3s buffer)
    // Flashlight-on CSS animation handles the white flash → cyan glow sequence
    const dotTimer = setTimeout(() => setDotIgnited(true), TIMELINE.dotIgnite);
    return () => clearTimeout(dotTimer);
  }, [prefersReduced]);

  return (
    <m.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 w-full z-50 bg-[color-mix(in_oklab,var(--bg-0)_70%,transparent)] backdrop-blur-[12px] border-b border-line"
    >
      <div className="max-w-6xl mx-auto px-6 h-[var(--header-h)] flex items-center justify-between">
        {/* Logo Area */}
        <div className="flex flex-col justify-center" style={{ textAlign: 'start' }}>
          <a
            href="#"
            aria-label="Nehorai"
            dir="ltr"
            className="text-2xl font-bold tracking-tighter text-fg-0 relative group inline-block w-max bidi-ltr"
          >
            <span aria-hidden="true">
              Nehor
              <span className="font-light logo-ai-neon">
                a
                <span className="relative inline-block">
                  <span
                    id="logo-dot"
                    className={`absolute top-[0.12em] left-[50%] -translate-x-1/2 w-[0.16em] h-[0.16em] rounded-full ${
                      dotIgnited ? 'flashlight-active' : 'opacity-0 scale-0 bg-white'
                    }`}
                  />
                  ı
                </span>
              </span>
            </span>
          </a>
          <span className="font-mono text-[10px] text-fg-2 tracking-[0.16em] uppercase mt-0.5 hidden sm:block">
            {navigation.eyebrow}
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { href: '#practice', label: navigation.links.practice },
            { href: '#showcase', label: navigation.links.showcase },
          ].map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-fg-1 hover:text-accent transition-colors">
              {item.label}
            </a>
          ))}
          <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
            {locales.map((nextLocale) => (
              <Link
                key={nextLocale}
                href={`/${nextLocale}`}
                hrefLang={nextLocale}
                lang={nextLocale}
                aria-current={locale === nextLocale ? 'true' : undefined}
                className={`min-w-10 rounded-full px-3 py-1 text-center text-xs font-semibold transition-colors ${
                  locale === nextLocale ? 'bg-accent text-[var(--fg-on-accent)]' : 'text-fg-2 hover:text-fg-0'
                }`}
              >
                {localeLabels[nextLocale]}
              </Link>
            ))}
          </div>
          <ThemeToggle />
          <a
            href="#dossier"
            className="btn btn-primary btn-sm hover:scale-[1.04] active:scale-[0.97] transition-transform duration-[var(--dur-1)]"
          >
            <Briefcase className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            {navigation.contactCta}
          </a>
        </div>

        {/* Mobile Toggle — 4.6: min 44×44 tap target */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            aria-label={mobileMenuOpen ? a11y.closeMenu : a11y.openMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls={menuPanelId}
            className="inline-flex h-11 w-11 items-center justify-center text-fg-1 hover:text-fg-0 transition-colors focus-visible:[box-shadow:var(--shadow-focus-ring)] rounded-[var(--r-1)] outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — 4.1: dialog role, focus-trap, Escape to close */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <m.div
            id={menuPanelId}
            role="dialog"
            aria-modal="true"
            aria-label={a11y.openMenu}
            ref={mobileTrapRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-page border-b border-line overflow-hidden"
            onKeyDown={(e) => { if (e.key === 'Escape') setMobileMenuOpen(false); }}
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              <div className="flex items-center gap-2">
                {locales.map((nextLocale) => (
                  <Link
                    key={nextLocale}
                    href={`/${nextLocale}`}
                    hrefLang={nextLocale}
                    lang={nextLocale}
                    aria-current={locale === nextLocale ? 'true' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`min-h-[44px] flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:[box-shadow:var(--shadow-focus-ring)] outline-none ${
                      locale === nextLocale
                        ? 'border-accent bg-accent text-[var(--fg-on-accent)]'
                        : 'border-line bg-surface text-fg-2 hover:text-fg-0'
                    }`}
                  >
                    {localeLabels[nextLocale]}
                  </Link>
                ))}
              </div>
              <a href="#practice" onClick={() => setMobileMenuOpen(false)} className="text-fg-1 hover:text-accent font-medium transition-colors py-2">{navigation.links.practice}</a>
              <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="text-fg-1 hover:text-accent font-medium transition-colors py-2">{navigation.links.showcase}</a>
              <a href="#dossier" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary mt-2">
                {navigation.contactCta}
              </a>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.nav>
  );
};
