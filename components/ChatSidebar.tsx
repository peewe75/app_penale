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
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'ai', 
      content: 'Buongiorno Avvocato. Sono pronto ad assisterla nell\'analisi del Processo Penale 4521/2024. Come posso aiutarla oggi?' 
    }
  ]);
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

    // Simulazione risposta AI dall'Architettura.txt
    setTimeout(() => {
      setIsTyping(false);
      let response = "Dall'analisi delle trascrizioni disponibili, non ho trovato riferimenti specifici. Può riformulare la domanda?";
      
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('denaro') || lowerInput.includes('soldi') || lowerInput.includes('200')) {
        response = "Al minuto [03:10] Rossi M. afferma esplicitamente: 'Ci servono almeno 200 metri di base', che nel contesto sembra essere un codice per 200.000€. Al minuto [05:40] si parla di un bonifico interinale.";
      } else if (lowerInput.includes('incontri') || lowerInput.includes('martedì')) {
        response = "Gli speaker pianificano un incontro fisico per martedì prossimo alle ore 21:00. Rossi insiste sulla necessità di vedersi 'senza telefoni'.";
      } else if (lowerInput.includes('giudice') || lowerInput.includes('ferretti')) {
        response = "Il nome del Dott. Ferretti compare al minuto [06:05]. Gli interlocutori discutono della sua influenza nell'istruttoria, cercando possibili basi di contatto.";
      }

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
        {messages.map((msg) => (
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
        ))}

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
