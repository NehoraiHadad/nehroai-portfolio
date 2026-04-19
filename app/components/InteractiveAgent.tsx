'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Terminal, Cpu, Bot, X } from 'lucide-react';
import { useDictionary, useDirection } from '@/lib/i18n/provider';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  agentName?: string;
}

export const InteractiveAgent = ({ onClose }: { onClose?: () => void } = {}) => {
  const { assistant } = useDictionary();
  const direction = useDirection();
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

  return (
    <div className={`relative w-full max-w-lg mx-auto lg:mx-0 backdrop-blur-xl border rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px] max-h-[80vh] transition-all duration-1000 ${
      matrixMode 
        ? 'bg-black/95 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]' 
        : 'bg-zinc-950/80 border-zinc-800'
    }`} dir={direction}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b transition-colors duration-1000 ${
        matrixMode ? 'border-green-900/50 bg-black/80' : 'border-zinc-800 bg-zinc-900/50'
      }`}>
        <div className="flex items-center gap-2">
          <Cpu className={`w-4 h-4 transition-colors duration-1000 ${matrixMode ? 'text-green-500' : 'text-cyan-400'}`} />
          <span className={`text-xs font-mono font-semibold tracking-wider transition-colors duration-1000 ${matrixMode ? 'text-green-500' : 'text-zinc-300'}`}>
            {matrixMode ? assistant.matrixTitle : assistant.title}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-1000 ${matrixMode ? 'bg-green-900' : 'bg-zinc-700'}`} />
            <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-1000 ${matrixMode ? 'bg-green-900' : 'bg-zinc-700'}`} />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          {onClose && (
            <button onClick={onClose} className={`transition-colors ${matrixMode ? 'text-green-700 hover:text-green-400' : 'text-zinc-400 hover:text-zinc-100'}`}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.type === 'system' ? (
                <div className={`text-[10px] font-mono my-1 flex items-center gap-1.5 transition-colors duration-1000 ${matrixMode ? 'text-green-600' : 'text-cyan-500/70'}`}>
                  <Terminal className="w-3 h-3" />
                  {msg.content}
                </div>
              ) : (
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 transition-all duration-1000 ${
                  msg.type === 'user' 
                    ? matrixMode 
                      ? 'bg-green-950/50 text-green-400 border border-green-500/30 chat-bubble-user font-mono'
                      : 'bg-cyan-500 text-zinc-950 chat-bubble-user' 
                    : matrixMode
                      ? 'bg-black text-green-500 border border-green-500/30 chat-bubble-agent font-mono shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                      : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 chat-bubble-agent'
                }`} style={{ textAlign: 'start' }}>
                  {msg.type === 'agent' && (
                    <div className={`flex items-center gap-1.5 mb-1 text-[10px] font-mono uppercase tracking-wider transition-colors duration-1000 ${matrixMode ? 'text-green-600' : 'text-cyan-400'}`}>
                      <Bot className="w-3 h-3" />
                      {msg.agentName}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed bidi-plaintext" dir="auto">{msg.content}</p>
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start"
            >
              <div className={`border rounded-2xl chat-bubble-agent px-4 py-3 flex items-center gap-1.5 transition-colors duration-1000 ${
                matrixMode ? 'bg-black border-green-500/30' : 'bg-zinc-800/50 border-zinc-700/50'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce transition-colors duration-1000 ${matrixMode ? 'bg-green-500' : 'bg-cyan-400'}`} style={{ animationDelay: '0ms' }} />
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce transition-colors duration-1000 ${matrixMode ? 'bg-green-500' : 'bg-cyan-400'}`} style={{ animationDelay: '150ms' }} />
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce transition-colors duration-1000 ${matrixMode ? 'bg-green-500' : 'bg-cyan-400'}`} style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
        {assistant.quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isTyping}
            className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              matrixMode 
                ? 'bg-black border-green-900 text-green-700 hover:text-green-400 hover:border-green-500/50 font-mono'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30'
            }`}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className={`p-4 pt-2 border-t transition-colors duration-1000 ${
        matrixMode ? 'border-green-900/50 bg-black/80' : 'border-zinc-800/50 bg-zinc-900/30'
      }`}>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            placeholder={matrixMode ? assistant.matrixInputPlaceholder : assistant.inputPlaceholder}
            dir="auto"
            className={`w-full border rounded-xl py-3 text-sm focus:outline-none transition-colors disabled:opacity-50 ${
              matrixMode
                ? 'bg-black border-green-900/50 text-green-500 placeholder:text-green-900 focus:border-green-500/50 font-mono'
                : 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500/50'
            }`}
            style={{ paddingInlineStart: '1rem', paddingInlineEnd: '3rem' }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className={`absolute p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
              matrixMode
                ? 'bg-green-900/30 text-green-500 hover:bg-green-900/60 border border-green-500/30 disabled:hover:bg-green-900/30'
                : 'bg-cyan-500 text-zinc-950 hover:bg-cyan-400 disabled:hover:bg-cyan-500'
            }`}
            style={{ insetInlineEnd: '0.5rem' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
