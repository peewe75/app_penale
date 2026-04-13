'use client';

import React, { useState, useEffect } from 'react';
import { Clock, MessageSquare, AlertTriangle, Shield, User, Info, Scale, Volume2 } from 'lucide-react';
import { useAppContext } from '@/lib/context/AppContext';
import { getEventsByCaseId, TimelineEventData } from '@/lib/api/transcripts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function TimelineView({ 
  onSeek
}: { 
  onSeek: (time: number) => void;
}) {
  const { activeCaseId } = useAppContext();
  const [events, setEvents] = useState<TimelineEventData[]>([]);

  useEffect(() => {
    if (activeCaseId) {
      getEventsByCaseId(activeCaseId).then(data => setEvents(data));
    } else {
      setEvents([]);
    }
  }, [activeCaseId]);

  const timeToSeconds = (timeStr: string) => {
    if(!timeStr.includes(':')) return parseInt(timeStr);
    const parts = timeStr.split(':').map(Number);
    if(parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return AlertTriangle;
      case 'legal': return Shield;
      case 'speaker': return User;
      case 'info': return Info;
      default: return Clock;
    }
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
          {events.length > 0 ? (
            <>
              {/* Vertical Line */}
              <div className="absolute left-[2.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-navy-800 via-navy-700 to-transparent" />

              <div className="space-y-8">
                {events.map((item: any, index: number) => (
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
                      {(() => {
                        const IconComponent = getIcon(item.type);
                        return <IconComponent className={cn(
                          "w-5 h-5",
                          item.type === 'alert' ? "text-red-400" : 
                          item.type === 'legal' ? "text-blue-400" : 
                          item.type === 'speaker' ? "text-purple-400" : "text-navy-400"
                        )} />;
                      })()}
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-navy-700/30 rounded-3xl bg-navy-900/10 mt-8">
              <div className="w-20 h-20 rounded-full bg-navy-900 border border-navy-800 flex items-center justify-center mb-6 shadow-2xl">
                <Clock className="w-10 h-10 text-navy-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Nessun Evento Estratto</h3>
              <p className="text-navy-400 text-sm max-w-md mb-8">
                Carica un file audio e avvia l'IA Forense per generare automaticamente la timeline analitica dell'intercettazione.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
