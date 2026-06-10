'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { Send, Terminal, Cpu, Bot, X } from 'lucide-react';
import { useDictionary, useDirection } from '@/lib/i18n/provider';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { TerminalFrame } from '@/app/components/TerminalFrame';
import { EASE_OUT } from '@/lib/motion';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  agentName?: string;
}

// 3.8: Jittered per-character typewriter for agent message streaming.
// base 26ms + rand(34ms); +40ms after space; +180ms after .!?
// Uses visibility (not opacity) so the span width is preserved — no reflow.
const JitteredTyping = ({
  text,
  reduced,
}: {
  text: string;
  reduced: boolean;
}) => {
  const [revealed, setRevealed] = useState(reduced ? text.length : 0);

  useEffect(() => {
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRevealed(text.length);
      return;
    }
    setRevealed(0);
    let cumulative = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < text.length; i++) {
      const prev = i > 0 ? text[i - 1] : '';
      let delay = 26 + Math.random() * 34;
      if (/[.!?]/.test(prev)) delay += 180;
      else if (prev === ' ') delay += 40;
      cumulative += delay;
      const idx = i + 1;
      timers.push(setTimeout(() => setRevealed(idx), cumulative));
    }
    return () => timers.forEach(clearTimeout);
  }, [text, reduced]);

  return (
    <span aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{ visibility: i < revealed ? 'visible' : 'hidden', display: 'inline' }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export const InteractiveAgent = ({ onClose }: { onClose?: () => void } = {}) => {
  const { assistant, a11y, dossier } = useDictionary();
  const direction = useDirection();
  const prefersReduced = usePrefersReducedMotion();
  const titleId = useId();
  const messageIdRef = useRef(assistant.initialMessages.length);
  const [messages, setMessages] = useState<Message[]>(
    assistant.initialMessages.map((message, index) => ({
      id: String(index + 1),
      ...message,
    }))
  );
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [matrixMode, setMatrixMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  const nextMessageId = () => {
    messageIdRef.current += 1;
    return String(messageIdRef.current);
  };

  const normalizeInput = (value: string) => value.toLocaleLowerCase().trim();
  const includesAnyKeyword = (value: string, keywords: string[]) =>
    keywords.some((keyword) => value.includes(normalizeInput(keyword)));
  const inputDirection = inputValue.trim() ? 'auto' : direction;

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsgId = nextMessageId();
    setMessages(prev => [...prev, { id: userMsgId, type: 'user', content: text }]);
    setInputValue('');
    setIsTyping(true);

    const normalizedText = normalizeInput(text);
    
    if (includesAnyKeyword(normalizedText, assistant.intentKeywords.commands.clear)) {
      setTimeout(() => {
        setMatrixMode(false);
        setMessages([
          { id: nextMessageId(), type: 'system', content: assistant.clearedMessage }
        ]);
        setIsTyping(false);
      }, 500);
      return;
    }

    if (includesAnyKeyword(normalizedText, assistant.intentKeywords.commands.help)) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: nextMessageId(), 
          type: 'system', 
          content: assistant.helpMessage 
        }]);
        setIsTyping(false);
      }, 500);
      return;
    }

    if (includesAnyKeyword(normalizedText, assistant.intentKeywords.commands.download)) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: nextMessageId(),
          type: 'system',
          content: assistant.downloadMessage
        }]);
        setIsTyping(false);
        // 5.11: trigger the actual CV download — locale-aware PDF path from dictionary
        const link = document.createElement('a');
        link.href = dossier.resumeFile;
        link.download = dossier.resumeDownloadName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 800);
      return;
    }

    if (includesAnyKeyword(normalizedText, assistant.intentKeywords.commands.matrix)) {
      setTimeout(() => {
        setMatrixMode(true);
        setMessages(prev => [...prev, { 
          id: nextMessageId(), 
          type: 'system', 
          content: assistant.matrixMessage 
        }]);
        setIsTyping(false);
      }, 800);
      return;
    }

    // Simulate Agentic Workflow
    setTimeout(() => {
      setMessages(prev => [...prev, { id: `${nextMessageId()}-sys1`, type: 'system', content: assistant.analyzingMessage }]);
    }, 600);

    setTimeout(() => {
      let agentName = assistant.agentNames.portfolio;
      let response = assistant.responses.default;

      if (includesAnyKeyword(normalizedText, assistant.intentKeywords.routing.showcase)) {
        agentName = assistant.agentNames.showcase;
        response = assistant.responses.showcase;
      } else if (includesAnyKeyword(normalizedText, assistant.intentKeywords.routing.tech)) {
        agentName = assistant.agentNames.tech;
        response = assistant.responses.tech;
      } else if (includesAnyKeyword(normalizedText, assistant.intentKeywords.routing.contact)) {
        agentName = assistant.agentNames.contact;
        response = assistant.responses.contact;
      }

      setMessages(prev => [...prev, {
        id: `${nextMessageId()}-sys2`,
        type: 'system',
        content: assistant.routingMessage.replace('{agentName}', agentName),
      }]);
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { id: `${nextMessageId()}-ans`, type: 'agent', agentName, content: response }]);
      }, 1000);

    }, 1500);
  };

  // Custom header for InteractiveAgent — token-driven via [data-matrix] on the panel root.
  // Passed as headerSlot to TerminalFrame so the shared panel shell is reused (3.3).
  const agentHeader = (
    <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface/50 transition-[background-color,border-color] duration-1000">
      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4 text-accent transition-colors duration-1000" aria-hidden="true" />
        {/* 4.2: title id used for aria-labelledby on the panel (when used as dialog) */}
        <span id={titleId} className="text-xs font-mono font-semibold tracking-wider text-fg-1 transition-colors duration-1000">
          {matrixMode ? assistant.matrixTitle : assistant.title}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-1.5" aria-hidden="true">
          <div className="w-2.5 h-2.5 rounded-full bg-line-strong transition-colors duration-1000" />
          <div className="w-2.5 h-2.5 rounded-full bg-line-strong transition-colors duration-1000" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
        </div>
        {onClose && (
          // 4.2 + 4.6: localized aria-label, 44×44 touch target
          <button
            onClick={onClose}
            aria-label={a11y.closeDialog}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--r-1)] text-fg-1 hover:text-fg-0 transition-colors focus-visible:[box-shadow:var(--shadow-focus-ring)] outline-none"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <TerminalFrame
      headerSlot={agentHeader}
      className="relative w-full max-w-lg mx-auto lg:mx-0 backdrop-blur-xl shadow-2xl flex flex-col h-[500px] max-h-[80vh] transition-[background-color,border-color,box-shadow] duration-1000 bg-page/80 border-line"
      bodyClassName="flex flex-col flex-1 overflow-hidden"
      dir={direction}
      data-matrix={matrixMode || undefined}
    >

      {/* 4.4: role="log" so new chat messages are announced by screen readers */}
      {/* 4.4: visually-hidden typing announcement */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {isTyping ? '…' : ''}
      </p>

      {/* Chat Area */}
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={assistant.title}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[color:var(--line-strong)] scrollbar-track-transparent"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <m.div
              key={msg.id}
              // 3.8: agent/system messages pop in with y+scale variants; user messages use simpler entry
              initial={
                prefersReduced
                  ? { opacity: 1 }
                  : msg.type === 'agent'
                    ? { opacity: 0, y: 8, scale: 0.96 }
                    : { opacity: 0, y: 10, scale: 0.95 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={
                prefersReduced
                  ? { duration: 0 }
                  : msg.type === 'agent'
                    ? { duration: 0.42, ease: EASE_OUT }
                    : { duration: 0.25 }
              }
              className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.type === 'system' ? (
                <div className="text-[10px] font-mono my-1 flex items-center gap-1.5 text-accent-text transition-colors duration-1000">
                  <Terminal className="w-3 h-3" />
                  {msg.content}
                </div>
              ) : (
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 transition-[background-color,border-color,color,box-shadow] duration-1000 ${
                  msg.type === 'user'
                    ? 'bg-accent text-[var(--fg-on-accent)] chat-bubble-user'
                    : 'bg-surface-raised/50 border border-line-strong/50 text-fg-0 chat-bubble-agent'
                }`} style={{ textAlign: 'start' }}>
                  {msg.type === 'agent' && (
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono uppercase tracking-wider text-accent transition-colors duration-1000">
                      <Bot className="w-3 h-3" />
                      {msg.agentName}
                    </div>
                  )}
                  {/* 3.8: jittered typing on agent messages; user/system render directly */}
                  {msg.type === 'agent' ? (
                    <p className="text-sm leading-relaxed bidi-plaintext" dir="auto">
                      <JitteredTyping text={msg.content} reduced={prefersReduced} />
                    </p>
                  ) : (
                    <p className="text-sm leading-relaxed bidi-plaintext" dir="auto">{msg.content}</p>
                  )}
                </div>
              )}
            </m.div>
          ))}
          {isTyping && (
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start"
            >
              <div className="border rounded-2xl chat-bubble-agent px-4 py-3 flex items-center gap-1.5 bg-surface-raised/50 border-line-strong/50 transition-[background-color,border-color] duration-1000">
                <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-accent transition-colors duration-1000" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-accent transition-colors duration-1000" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-accent transition-colors duration-1000" style={{ animationDelay: '300ms' }} />
              </div>
            </m.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts — 4.6: py-2 bumps chip hit area toward 44px */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
        {assistant.quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isTyping}
            className="whitespace-nowrap text-xs font-medium px-3 py-2 rounded-full border bg-surface border-line text-fg-1 hover:text-accent hover:border-accent/30 transition-[color,border-color,background-color] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:[box-shadow:var(--shadow-focus-ring)] outline-none"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 pt-2 border-t border-line/50 bg-surface/30 transition-[background-color,border-color] duration-1000">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
          className="relative flex items-center"
        >
          {/* 4.2: localized aria-label; 4.5: visible focus ring replacing outline-none */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            placeholder={matrixMode ? assistant.matrixInputPlaceholder : assistant.inputPlaceholder}
            aria-label={a11y.chatInput}
            dir={inputDirection}
            className="w-full border rounded-xl py-3 text-sm outline-none bg-page border-line text-fg-0 placeholder:text-fg-2 focus-visible:[box-shadow:var(--shadow-focus-ring)] transition-[border-color,box-shadow,color,background-color] disabled:opacity-50"
            style={{ paddingInlineStart: '1rem', paddingInlineEnd: '3rem', textAlign: 'start' }}
          />
          {/* 4.2: localized aria-label; 4.6: h-11 w-11 inside the input — visually 36px, touch area padded */}
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            aria-label={a11y.sendMessage}
            className="absolute inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-[var(--fg-on-accent)] hover:bg-accent-hover transition-[background-color] disabled:opacity-50 focus-visible:[box-shadow:var(--shadow-focus-ring)] outline-none"
            style={{ insetInlineEnd: '0.5rem' }}
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </TerminalFrame>
  );
};
