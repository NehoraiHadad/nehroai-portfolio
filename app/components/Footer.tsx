'use client';

import React from 'react';
import { Mail, Github, Linkedin } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/provider';

export const Footer = () => {
  const { footer, dossier } = useDictionary();

  return (
    <footer className="border-t border-line bg-page relative z-10">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-fg-2 bidi-ltr" dir="ltr">
          nehorai // engineering
        </span>

        {/* Direct contact chips */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <a
            href={dossier.contact.emailUrl}
            className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded border border-line text-fg-3 hover:text-accent hover:border-accent/50 transition-colors bidi-ltr"
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
          >
            <Mail className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
            {dossier.contact.emailLabel}
          </a>
          <a
            href={dossier.contact.githubUrl}
            className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded border border-line text-fg-3 hover:text-accent hover:border-accent/50 transition-colors bidi-ltr"
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
          >
            <Github className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
            {dossier.contact.githubLabel}
          </a>
          <a
            href={dossier.contact.linkedinUrl}
            className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded border border-line text-fg-3 hover:text-accent hover:border-accent/50 transition-colors bidi-ltr"
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
          >
            <Linkedin className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
            {dossier.contact.linkedinLabel}
          </a>
        </div>

        <p className="text-fg-2 text-sm">
          {footer.copyrightTemplate.replace('{year}', String(new Date().getFullYear()))}
        </p>
      </div>
    </footer>
  );
};
