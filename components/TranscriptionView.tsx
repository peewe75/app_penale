'use client';

import React, { useEffect, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Segment {
  id: number;
  time: number;
  end: number;
  speaker: string;
  text: string;
}

interface TranscriptionViewProps {
  segments: Segment[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function TranscriptionView({ segments, currentTime, onSeek }: TranscriptionViewProps) {
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
    <div className="flex-1 overflow-y-auto bg-navy-950/20" ref={scrollContainerRef}>
      <div className="max-w-4xl mx-auto p-6 space-y-1">
        {segments.map((segment) => {
          const active = isSegmentActive(segment);
          return (
            <div 
              key={segment.id}
              ref={active ? activeSegmentRef : null}
              className={cn(
                "segment-row flex gap-6 p-4 rounded-lg cursor-default border-l-4 transition-all",
                active 
                  ? "active bg-gold-500/10 border-gold-500 shadow-sm" 
                  : "border-transparent hover:bg-navy-800/10 hover:border-navy-700/30"
              )}
            >
              {/* Meta info: Timestamp and Speaker */}
              <div className="w-32 flex-shrink-0 space-y-2">
                <button 
                  onClick={() => onSeek(segment.time)}
                  className={cn(
                    "timestamp inline-block transition-all",
                    active && "active"
                  )}
                >
                  {formatTime(segment.time)}
                </button>
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-block",
                  segment.speaker.includes('Rossi') 
                    ? "bg-gold-500/10 text-gold-500" 
                    : "bg-purple-500/10 text-purple-400"
                )}>
                  {segment.speaker}
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1">
                <p className={cn(
                  "text-sm leading-relaxed transition-colors",
                  active ? "text-white font-medium" : "text-navy-200 opacity-80"
                )}>
                  {segment.text}
                </p>
              </div>
            </div>
          );
        })}

        {/* Padding bottom */}
        <div className="h-32" />
      </div>
    </div>
  );
}
