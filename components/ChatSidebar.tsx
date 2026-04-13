'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function ChatSidebar() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulazione del ritardo AI per i test
    setTimeout(() => {
      setIsTyping(false);
      const response = "Modulo AI in attesa di connessione API. Questa è una risposta di test generica per E2E.";
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response
      }]);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col glass-strong border-l border-navy-700/30">
      {/* Header */}
      <div className="p-4 border-b border-navy-700/20 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-gold-500" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-navy-400">Analisi AI Protetta</h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
             <Bot className="w-10 h-10 text-navy-500 mb-2" />
             <p className="text-xs font-bold text-navy-300">Assistente AI</p>
             <p className="text-[10px] text-navy-500 max-w-[200px]">Nessuna conversazione attiva. Fai una domanda per iniziare l'analisi.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id}
              className={cn(
                "flex gap-3 fade-in",
                msg.role === 'user' ? "flex-row-reverse" : ""
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
                msg.role === 'ai' 
                  ? "bg-gradient-to-br from-gold-500 to-gold-700" 
                  : "bg-navy-700"
              )}>
                {msg.role === 'ai' ? <Bot className="w-4 h-4 text-navy-950" /> : <User className="w-4 h-4 text-gold-400" />}
              </div>

              {/* Bubble */}
              <div className={cn(
                "p-3 rounded-xl max-w-[85%] text-sm leading-relaxed",
                msg.role === 'ai' 
                  ? "chat-bubble-ai rounded-tl-sm text-navy-100" 
                  : "chat-bubble-user rounded-tr-sm text-navy-200"
              )}>
                {msg.content}
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex gap-3 fade-in">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-navy-950" />
            </div>
            <div className="chat-bubble-ai rounded-xl rounded-tl-sm p-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-navy-700/20">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Fai una domanda sulla trascrizione..."
            className="w-full bg-navy-900/50 border border-navy-700/30 rounded-xl p-3 pr-12 text-sm text-navy-200 placeholder:text-navy-500 focus:outline-none focus:border-gold-500/50 transition-colors resize-none chat-input"
            rows={2}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 bottom-2 p-2 rounded-lg bg-gold-500 hover:bg-gold-400 disabled:opacity-50 disabled:hover:bg-gold-500 text-navy-950 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-navy-600 mt-2 text-center">
          L'intelligenza artificiale può commettere errori. Verifica sempre le informazioni.
        </p>
      </div>
    </aside>
  );
}
