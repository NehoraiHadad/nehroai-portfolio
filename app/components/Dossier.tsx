'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Send, Lock } from 'lucide-react';
import { useReveal } from '@/lib/useReveal';
import { sendContact } from '@/app/lib/actions/contact';

type SubmitPhase = '' | 'encrypting' | 'transmitting';

const INIT_LINES = [
  '> INITIALIZING SECURE CHANNEL...',
  '> ESTABLISHING ENCRYPTED TUNNEL...',
  '> CHANNEL READY.',
];

const AsciiBar = ({ pct, label }: { pct: number; label: string }) => {
  const filled = Math.round(pct / 10);
  return (
    <div className="font-mono text-xs space-y-1">
      <p className="text-zinc-500">{label}</p>
      <p>
        <span className="text-cyan-400">{'█'.repeat(filled)}</span>
        <span className="text-zinc-700">{'░'.repeat(10 - filled)}</span>
        <span className="text-zinc-400 ml-2">{pct}%</span>
      </p>
    </div>
  );
};

export const Dossier = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('');
  const [initStep, setInitStep] = useState(-1);
  const [initialized, setInitialized] = useState(false);
  const ref = useReveal<HTMLElement>();

  useEffect(() => {
    const timers = [
      setTimeout(() => setInitStep(0), 80),
      setTimeout(() => setInitStep(1), 500),
      setTimeout(() => setInitStep(2), 920),
      setTimeout(() => setInitialized(true), 1380),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    setError(null);
    setIsSubmitting(true);
    setSubmitPhase('encrypting');
    await new Promise(r => setTimeout(r, 700));
    setSubmitPhase('transmitting');

    const result = await sendContact({ name, email, message });
    setIsSubmitting(false);

    if (result.ok) {
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
      setSubmitPhase('');
      setTimeout(() => setIsSubmitted(false), 9000);
    } else {
      setSubmitPhase('');
      setError(result.error);
    }
  };

  return (
    <section
      id="dossier"
      ref={ref}
      className="py-28 px-6 relative z-10 border-t border-zinc-800/50"
    >
      {/* Ambient glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="reveal max-w-5xl mx-auto">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.2em]">04 — CONTACT</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 items-start">

          {/* ── LEFT ─────────────────────────────── */}
          <div className="flex flex-col gap-10">

            {/* Headline */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="font-mono text-[10px] text-green-400 tracking-[0.15em] uppercase">Available · Israel / Remote</span>
              </div>

              <h2 className="font-display text-5xl md:text-6xl font-bold text-zinc-100 leading-[1.05] tracking-tight mb-5">
                Open to<br />
                the right<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                  opportunity.
                </span>
              </h2>

              <p className="text-zinc-400 text-base leading-relaxed max-w-xs">
                Full-stack + AI roles. Building AI products, automation, or modern web infrastructure? Let's talk.
              </p>
            </div>

            {/* Stack lines */}
            <div className="space-y-4">
              {[
                { tag: 'AI', stack: 'LangGraph · AgentCore · MCP · RAG' },
                { tag: 'WEB', stack: 'Next.js · React · TypeScript · Python' },
                { tag: 'INFRA', stack: 'Oracle Cloud · Docker · PM2 · On-prem' },
              ].map(({ tag, stack }) => (
                <div key={tag} className="flex items-center gap-4">
                  <span className="font-mono text-[9px] text-cyan-500 tracking-widest w-8">{tag}</span>
                  <div className="h-px w-4 bg-zinc-700" />
                  <span className="font-mono text-xs text-zinc-500">{stack}</span>
                </div>
              ))}
            </div>

            {/* CV */}
            <motion.a
              whileHover={{ x: 4 }}
              href="/Nehorai Hadad CV - SW.pdf"
              download="Nehorai Hadad CV - SW.pdf"
              className="inline-flex items-center gap-3 text-zinc-400 hover:text-zinc-100 transition-colors text-sm font-medium w-fit group"
            >
              <span className="w-8 h-8 rounded-lg border border-zinc-800 group-hover:border-zinc-600 flex items-center justify-center transition-colors">
                <FileText className="w-3.5 h-3.5" />
              </span>
              Download Resume
            </motion.a>
          </div>

          {/* ── RIGHT: Terminal ───────────────────── */}
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-3 bg-cyan-500/[0.03] rounded-3xl blur-2xl" />

            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50">

              {/* Window chrome */}
              <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800/80">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-700 hover:bg-red-400 transition-colors cursor-default" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700 hover:bg-amber-400 transition-colors cursor-default" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700 hover:bg-green-400 transition-colors cursor-default" />
                  <span className="font-mono text-[10px] text-zinc-600 ml-3 select-none">secure_channel.sh</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-green-500" />
                  <span className="font-mono text-[9px] text-green-500 tracking-widest">TLS 1.3</span>
                </div>
              </div>

              {/* Scanlines */}
              <div
                className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 4px)' }}
              />

              {/* Terminal body */}
              <div className="relative p-6 min-h-[340px] flex flex-col">
                <AnimatePresence mode="wait">

                  {/* ① Init sequence */}
                  {!initialized && (
                    <motion.div
                      key="init"
                      exit={{ opacity: 0 }}
                      className="flex-grow flex flex-col justify-center gap-2"
                    >
                      {INIT_LINES.map((line, i) => (
                        <AnimatePresence key={i}>
                          {initStep >= i && (
                            <motion.p
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.25 }}
                              className={`font-mono text-xs ${i < initStep ? 'text-zinc-600' : 'text-cyan-400'}`}
                            >
                              {line}
                              {i === initStep && i < INIT_LINES.length - 1 && (
                                <span className="inline-block w-[6px] h-[12px] bg-cyan-400 ml-1 animate-pulse align-middle" />
                              )}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      ))}
                    </motion.div>
                  )}

                  {/* ② Submitting */}
                  {initialized && isSubmitting && (
                    <motion.div
                      key="submitting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-grow flex flex-col justify-center gap-4"
                    >
                      <AsciiBar
                        pct={submitPhase === 'encrypting' ? 55 : 100}
                        label={submitPhase === 'encrypting' ? '> ENCRYPTING PAYLOAD...' : '> TRANSMITTING...'}
                      />
                      <motion.p
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="font-mono text-[10px] text-zinc-600"
                      >
                        {submitPhase === 'encrypting'
                          ? '  securing your message...'
                          : '  routing to nehoraihadad.com...'}
                      </motion.p>
                    </motion.div>
                  )}

                  {/* ③ Success */}
                  {initialized && !isSubmitting && isSubmitted && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-grow flex flex-col justify-center gap-2 font-mono text-xs"
                    >
                      <p className="text-zinc-700">{'─'.repeat(32)}</p>
                      <p><span className="text-zinc-600">&gt; </span><span className="text-green-400">STATUS: DELIVERED ✓</span></p>
                      <p><span className="text-zinc-600">&gt; </span><span className="text-zinc-400">RESPONSE_ETA: 24–48H</span></p>
                      <p className="text-zinc-700">{'─'.repeat(32)}</p>
                      <p className="text-zinc-500 pt-2">Thanks — message received.</p>
                      <p className="text-zinc-600">I'll reply within a day or two.</p>
                      <span className="inline-block w-[6px] h-[12px] bg-zinc-700 animate-pulse mt-1" />
                    </motion.div>
                  )}

                  {/* ④ Form */}
                  {initialized && !isSubmitting && !isSubmitted && (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSubmit}
                      className="flex flex-col flex-grow gap-6"
                    >
                      {/* Name */}
                      <div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="font-mono text-xs text-zinc-600">&gt;</span>
                          <label htmlFor="name" className="font-mono text-[10px] text-cyan-500 uppercase tracking-widest">
                            SENDER_NAME
                          </label>
                        </div>
                        <input
                          type="text"
                          id="name"
                          required
                          value={name}
                          onChange={(e) => { setName(e.target.value); setError(null); }}
                          disabled={isSubmitting}
                          placeholder="Your name"
                          className="w-full bg-transparent border-0 border-b border-zinc-800 focus:border-cyan-500/40 text-zinc-200 text-sm font-mono py-2 placeholder:text-zinc-700 focus:outline-none transition-colors disabled:opacity-40"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="font-mono text-xs text-zinc-600">&gt;</span>
                          <label htmlFor="email" className="font-mono text-[10px] text-cyan-500 uppercase tracking-widest">
                            SENDER_EMAIL
                          </label>
                        </div>
                        <input
                          type="email"
                          id="email"
                          required
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(null); }}
                          disabled={isSubmitting}
                          placeholder="you@company.com"
                          className="w-full bg-transparent border-0 border-b border-zinc-800 focus:border-cyan-500/40 text-zinc-200 text-sm font-mono py-2 placeholder:text-zinc-700 focus:outline-none transition-colors disabled:opacity-40"
                        />
                      </div>

                      {/* Message */}
                      <div className="flex flex-col flex-grow">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="font-mono text-xs text-zinc-600">&gt;</span>
                          <label htmlFor="message" className="font-mono text-[10px] text-cyan-500 uppercase tracking-widest">
                            MESSAGE_BODY
                          </label>
                        </div>
                        <textarea
                          id="message"
                          required
                          value={message}
                          onChange={(e) => { setMessage(e.target.value); setError(null); }}
                          disabled={isSubmitting}
                          placeholder="Enter transmission data..."
                          className="flex-grow w-full bg-transparent border-0 border-b border-zinc-800 focus:border-cyan-500/40 text-zinc-200 text-sm font-mono py-2 placeholder:text-zinc-700 focus:outline-none transition-colors resize-none disabled:opacity-40 min-h-[90px]"
                        />
                      </div>

                      {/* Error */}
                      {error && (
                        <p className="font-mono text-[11px] text-red-400" aria-live="polite">
                          <span className="text-zinc-600">&gt; ERR: </span>{error}
                        </p>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting || !name || !email || !message}
                        className="flex items-center justify-center gap-2 py-3 rounded-lg font-mono text-[11px] uppercase tracking-widest border border-cyan-500/25 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500 hover:text-zinc-950 hover:border-cyan-500 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Send className="w-3.5 h-3.5" />
                        TRANSMIT
                      </button>
                    </motion.form>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
