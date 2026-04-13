'use client';

import React, { useEffect, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Bookmark, MessageCircle, AlertTriangle } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Segment {
  id: number;
  time: number;
  end: number;
  speaker: string;
  text: string;
  importance?: 'critical' | 'normal';
}

const defaultSegments: Segment[] = [
  { id: 1, time: 0, end: 5, speaker: 'Rossi M.', text: 'Buongiorno dottore, scusi il disturbo a quest\'ora.' },
  { id: 2, time: 5, end: 12, speaker: 'Speaker 2', text: 'Nessun problema Rossi. Mi dica pure, è successo qualcosa per quel carico?' },
  { id: 3, time: 12, end: 28, speaker: 'Rossi M.', text: 'Sì, abbiamo dovuto cambiare rotta. Sa, con i controlli che ci sono adesso al molo 4, ho preferito non rischiare. Ci siamo spostati più a sud.', importance: 'critical' },
  { id: 4, time: 28, end: 35, speaker: 'Speaker 2', text: 'Capisco. Ma questo comporta ritardi? Il cliente ha già versato l\'acconto.' },
  { id: 5, time: 35, end: 55, speaker: 'Rossi M.', text: 'No, nessun ritardo significativo. Domani sera verso le 21 saremo alla base. I "200 metri di base" sono pronti per essere consegnati.', importance: 'critical' },
  { id: 6, time: 55, end: 68, speaker: 'Speaker 2', text: 'Perfetto. Mi tenga aggiornato via Telegram, non chiami su questa linea.' },
  { id: 7, time: 68, end: 85, speaker: 'Rossi M.', text: 'Ricevuto. Sto già smontando la scheda. A domani.' },
];

interface TranscriptionViewProps {
  segments?: Segment[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function TranscriptionView({ segments = defaultSegments, currentTime, onSeek }: TranscriptionViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSegmentRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTime]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const isSegmentActive = (segment: Segment) => {
    return currentTime >= segment.time && currentTime < segment.end;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0D14]" ref={scrollContainerRef}>
      <div className="max-w-4xl mx-auto p-8 space-y-4">
        {segments.map((segment) => {
          const active = isSegmentActive(segment);
          return (
            <div 
              key={segment.id}
              ref={active ? activeSegmentRef : null}
              className={cn(
                "group flex gap-8 p-6 rounded-2xl cursor-pointer transition-all duration-300 border",
                active 
                  ? "bg-[#121620] border-gold-500/50 shadow-[0_0_20px_rgba(212,175,55,0.05)] scale-[1.01]" 
                  : "bg-transparent border-transparent hover:bg-white/5"
              )}
              onClick={() => onSeek(segment.time)}
            >
              {/* Meta info */}
              <div className="w-20 pt-1 flex flex-col gap-3 flex-shrink-0">
                <span className={cn(
                  "font-mono text-xs font-bold tracking-tighter transition-colors",
                  active ? "text-gold-500" : "text-navy-600 group-hover:text-navy-400"
                )}>
                  {formatTime(segment.time)}
                </span>
                <div className="flex flex-col gap-1.5 pt-2 border-t border-navy-800/50">
                   <div className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md inline-block text-center",
                    segment.speaker === 'Rossi M.' 
                      ? "bg-gold-500/10 text-gold-500 border border-gold-500/20" 
                      : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  )}>
                    {segment.speaker}
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 space-y-3">
                <p className={cn(
                  "text-base leading-relaxed transition-all duration-300",
                  active ? "text-white" : "text-navy-400 group-hover:text-navy-200"
                )}>
                  {segment.text}
                </p>
                
                {segment.importance === 'critical' && (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-red-400 uppercase tracking-widest bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">
                      <AlertTriangle className="w-3 h-3" /> Marcatori Critici
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={cn(
                "flex flex-col gap-2 transition-opacity",
                active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
              )}>
                <button className="p-2 rounded-lg hover:bg-navy-800 text-navy-400 hover:text-white transition-all">
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-navy-800 text-navy-400 hover:text-white transition-all">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Padding bottom */}
        <div className="h-40" />
      </div>
    </div>
  );
}
