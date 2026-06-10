'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Layers } from 'lucide-react';
import { useReveal } from '@/lib/useReveal';
import { useDictionary, useDirection } from '@/lib/i18n/provider';

export const ThePractice = () => {
  const ref = useReveal<HTMLElement>();
  const { practice, skills } = useDictionary();
  const direction = useDirection();
  const isRtl = direction === 'rtl';

  return (
    <section
      id="practice"
      ref={ref}
      className="py-24 px-6 relative z-10 border-y border-line bg-[var(--bg-1)]/30"
    >
      <div className="max-w-6xl mx-auto">
        <div className="reveal mb-16" style={{ textAlign: isRtl ? 'start' : 'center' }}>
          <span className="section-marker mb-4" style={{ justifyContent: isRtl ? 'flex-start' : 'center' }} dir="ltr">
            01 — STACK
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-fg-0 mt-4 tracking-tight">
            {practice.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skillGroup, idx) => (
            <motion.div
              key={idx}
              className="reveal-pop card p-6 transition-colors duration-200"
              style={{ '--reveal-delay': `${idx * 100}ms` } as React.CSSProperties}
              whileHover={{ y: -4, borderColor: 'var(--accent)' }}
              dir={isRtl ? 'ltr' : undefined}
            >
              <h3 className="text-fg-0 text-base font-semibold mb-4 flex items-center gap-2 bidi-ltr" style={{ textAlign: 'left' }}>
                <Layers className="w-4 h-4 text-accent shrink-0" strokeWidth={1.5} />
                {skillGroup.category}
              </h3>
              <ul className="space-y-3">
                {skillGroup.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-fg-1 text-sm flex items-start gap-2 font-mono bidi-ltr"
                    style={{ textAlign: 'left' }}
                  >
                    <span className="text-accent mt-0.5 shrink-0" aria-hidden="true">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
