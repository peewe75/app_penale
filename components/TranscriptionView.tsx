'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, AlertTriangle } from 'lucide-react';
import { useAppContext } from '@/lib/context/AppContext';
import { getSegmentsByCaseId, SegmentData } from '@/lib/api/transcripts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TranscriptionViewProps {
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function TranscriptionView({ currentTime, onSeek }: TranscriptionViewProps) {
  const { activeCaseId } = useAppContext();
  const [segments, setSegments] = useState<SegmentData[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeCaseId) {
      getSegmentsByCaseId(activeCaseId).then((data) => setSegments(data));
    } else {
      setSegments([]);
    }
  }, [activeCaseId]);

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

  const isSegmentActive = (segment: SegmentData) => currentTime >= segment.time && currentTime < segment.end;

  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0D14]" ref={scrollContainerRef}>
      <div className="max-w-4xl mx-auto p-8 space-y-4">
        {segments.length > 0 ? (
          <>
            {segments.map((segment) => {
              const active = isSegmentActive(segment);
              return (
                <div
                  key={segment.id}
                  ref={active ? activeSegmentRef : null}
                  className={cn(
                    'group flex gap-8 p-6 rounded-2xl cursor-pointer transition-all duration-300 border',
                    active
                      ? 'bg-[#121620] border-gold-500/50 shadow-[0_0_20px_rgba(212,175,55,0.05)] scale-[1.01]'
                      : 'bg-transparent border-transparent hover:bg-white/5'
                  )}
                  onClick={() => onSeek(segment.time)}
                >
                  <div className="w-20 pt-1 flex flex-col gap-3 flex-shrink-0">
                    <span
                      className={cn(
                        'font-mono text-xs font-bold tracking-tighter transition-colors',
                        active ? 'text-gold-500' : 'text-navy-600 group-hover:text-navy-400'
                      )}
                    >
                      {formatTime(segment.time)}
                    </span>
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-navy-800/50">
                      <div
                        className={cn(
                          'text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md inline-block text-center',
                          segment.speaker === 'Rossi M.'
                            ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        )}
                      >
                        {segment.speaker}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <p
                      className={cn(
                        'text-base leading-relaxed transition-all duration-300',
                        active ? 'text-white' : 'text-navy-400 group-hover:text-navy-200'
                      )}
                    >
                      {segment.text}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {segment.importance === 'critical' && (
                        <span className="flex items-center gap-1.5 text-[9px] font-bold text-red-400 uppercase tracking-widest bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">
                          <AlertTriangle className="w-3 h-3" /> Marcatori Critici
                        </span>
                      )}
                      <span className="text-[9px] font-bold uppercase tracking-widest text-navy-500 bg-navy-900/60 px-2 py-0.5 rounded border border-navy-800">
                        Click per sincronizzare il player
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="h-40" />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-navy-700/30 rounded-3xl bg-navy-900/10">
            <div className="w-20 h-20 rounded-full bg-navy-900 border border-navy-800 flex items-center justify-center mb-6 shadow-2xl">
              <MessageCircle className="w-10 h-10 text-navy-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Trascrizione Non Disponibile</h3>
            <p className="text-navy-400 text-sm max-w-md mb-8">
              Avvia l'elaborazione dell'intercettazione audio. Il sistema usera il modello AI configurato per uso forense.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
