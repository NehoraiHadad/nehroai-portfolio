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
      className="py-24 px-6 relative z-10 border-y border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm"
    >
      <div className="max-w-6xl mx-auto">
        <div className="reveal mb-16" style={{ textAlign: isRtl ? 'start' : 'center' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4 tracking-tight">
            {practice.title}
          </h2>
          <p className={`text-zinc-400 text-lg max-w-2xl ${isRtl ? '' : 'mx-auto'}`}>
            {practice.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skillGroup, idx) => (
            <motion.div
              key={idx}
              className="reveal bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-xl transition-colors duration-300"
              style={{ '--reveal-delay': `${idx * 100}ms` } as React.CSSProperties}
              whileHover={{ y: -5, borderColor: 'rgba(6, 182, 212, 0.5)' }}
              dir={isRtl ? 'ltr' : undefined}
            >
              <h3 className="text-zinc-100 font-semibold mb-4 flex items-center gap-2 bidi-ltr" style={{ textAlign: 'left' }}>
                <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                {skillGroup.category}
              </h3>
              <ul className="space-y-3">
                {skillGroup.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-zinc-400 text-sm flex items-start gap-2 font-mono bidi-ltr"
                    style={{ textAlign: 'left' }}
                  >
                    <span className="text-cyan-500/50 mt-0.5 shrink-0" aria-hidden="true">•</span>
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
