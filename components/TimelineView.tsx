'use client';

import React from 'react';
import { Clock, MessageSquare, AlertTriangle, Shield, User, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const timelineData = [
  { 
    time: '00:00', 
    type: 'info', 
    title: 'Inizio registrazione', 
    desc: 'Avvio intercettazione ambientale. Qualità audio: Ottima.',
    icon: Clock
  },
  { 
    time: '00:15', 
    type: 'speaker', 
    title: 'Identificazione Rossi M.', 
    desc: 'Lo speaker entra nel raggio d\'azione. Voce nitida.',
    icon: User
  },
  { 
    time: '03:10', 
    type: 'alert', 
    title: 'Riferimento critico', 
    desc: 'Menzione di "200 metri di base". Possibile linguaggio in codice per 200.000€.',
    icon: AlertTriangle
  },
  { 
    time: '05:40', 
    type: 'legal', 
    title: 'Riferimento a bonifico', 
    desc: 'Discussione su movimentazione fondi verso filiale estera.',
    icon: Shield
  },
  { 
    time: '06:05', 
    type: 'speaker', 
    title: 'Menzione Terzi', 
    desc: 'Viene citato il Dott. Ferretti (Giudice Istruttore).',
    icon: MessageSquare
  },
  { 
    time: '08:30', 
    type: 'alert', 
    title: 'Pianificazione incontro', 
    desc: 'Organizzazione appuntamento fisico per Martedì ore 21:00.',
    icon: AlertTriangle
  }
];

export default function TimelineView({ onSeek }: { onSeek: (time: number) => void }) {
  const timeToSeconds = (timeStr: string) => {
    const [min, sec] = timeStr.split(':').map(Number);
    return min * 60 + sec;
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-navy-950/20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Timeline Analitica</h2>
            <p className="text-navy-400 text-sm">Eventi chiave estratti automaticamente dall'IA forense.</p>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-800 text-xs text-navy-300 border border-navy-700">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500" /> Critico
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-800 text-xs text-navy-300 border border-navy-700">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Speaker
            </span>
          </div>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[2.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-navy-800 via-navy-700 to-transparent" />

          <div className="space-y-8">
            {timelineData.map((item, index) => (
              <div 
                key={index}
                className="relative flex gap-8 group"
              >
                {/* Time Label */}
                <div className="w-12 text-right pt-2">
                  <span className="text-xs font-mono text-navy-500 group-hover:text-gold-500 transition-colors">
                    {item.time}
                  </span>
                </div>

                {/* Icon Hub */}
                <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-xl bg-navy-900 border border-navy-700 flex items-center justify-center group-hover:border-gold-500/50 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all">
                  <item.icon className={cn(
                    "w-5 h-5",
                    item.type === 'alert' ? "text-red-400" : 
                    item.type === 'legal' ? "text-blue-400" : 
                    item.type === 'speaker' ? "text-purple-400" : "text-navy-400"
                  )} />
                </div>

                {/* Content Card */}
                <div 
                  className="flex-1 glass-card rounded-2xl p-5 border border-navy-700/10 hover:border-navy-700/30 transition-all cursor-pointer group-hover:translate-x-1"
                  onClick={() => onSeek(timeToSeconds(item.time))}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-white group-hover:text-gold-500 transition-colors">{item.title}</h3>
                    <button className="text-[10px] text-navy-500 uppercase tracking-widest font-bold hover:text-white">Vai al minuto →</button>
                  </div>
                  <p className="text-sm text-navy-400 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* End cap */}
          <div className="flex items-center justify-center p-12 mt-8">
            <div className="px-4 py-2 rounded-lg bg-navy-900/50 border border-navy-800 text-[10px] text-navy-500 uppercase tracking-widest font-bold">
              Fine Analisi Preliminare
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
