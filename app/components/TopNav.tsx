'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Menu, X } from 'lucide-react';
import { locales } from '@/lib/i18n/config';
import { useDictionary, useLocale } from '@/lib/i18n/provider';

export const TopNav = ({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean, setMobileMenuOpen: (v: boolean) => void }) => {
  const [dotIgnited, setDotIgnited] = useState(false);
  const { navigation } = useDictionary();
  const locale = useLocale();
  const localeLabels: Record<(typeof locales)[number], string> = {
    en: 'EN',
    he: 'עב',
  };

  useEffect(() => {
    // Dot ignites after neon "ai" ignition stabilizes (~3.5s end + 0.3s buffer)
    // Flashlight-on CSS animation handles the white flash → cyan glow sequence
    const dotTimer = setTimeout(() => setDotIgnited(true), 3800);
    return () => clearTimeout(dotTimer);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50"
    >
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo Area */}
        <div className="flex flex-col justify-center" style={{ textAlign: 'start' }}>
          <a
            href="#"
            aria-label="Nehorai"
            dir="ltr"
            className="text-2xl font-bold tracking-tighter text-zinc-100 relative group inline-block w-max bidi-ltr"
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
          <span className="text-[10px] text-zinc-500 tracking-widest uppercase mt-0.5 hidden sm:block">
            {navigation.eyebrow}
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: '#practice', label: navigation.links.practice },
            { href: '#showcase', label: navigation.links.showcase },
          ].map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-zinc-400 hover:text-cyan-400 transition-colors">
              {item.label}
            </a>
          ))}
          <div className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/70 p-1">
            {locales.map((nextLocale) => (
              <Link
                key={nextLocale}
                href={`/${nextLocale}`}
                className={`min-w-10 rounded-full px-3 py-1 text-center text-xs font-semibold transition-colors ${
                  locale === nextLocale ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {localeLabels[nextLocale]}
              </Link>
            ))}
          </div>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#dossier" 
            className="bg-zinc-100 text-zinc-950 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white transition-colors flex items-center gap-2 shadow-sm"
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            {navigation.contactCta}
          </motion.a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-zinc-400 hover:text-zinc-100 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-zinc-950 border-b border-zinc-800 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              <div className="flex items-center gap-2">
                {locales.map((nextLocale) => (
                  <Link
                    key={nextLocale}
                    href={`/${nextLocale}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      locale === nextLocale
                        ? 'border-zinc-100 bg-zinc-100 text-zinc-950'
                        : 'border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    {localeLabels[nextLocale]}
                  </Link>
                ))}
              </div>
              <a href="#practice" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-cyan-400 font-medium transition-colors">{navigation.links.practice}</a>
              <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-cyan-400 font-medium transition-colors">{navigation.links.showcase}</a>
              <a href="#dossier" onClick={() => setMobileMenuOpen(false)} className="bg-zinc-100 text-zinc-950 px-4 py-2 rounded-lg text-sm font-semibold text-center mt-2">
                {navigation.contactCta}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
