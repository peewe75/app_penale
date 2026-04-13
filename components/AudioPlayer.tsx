'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  Clock,
  Maximize2,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AudioPlayerProps {
  url?: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  currentTime: number;
  duration: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onWaveSurferReady?: (ws: WaveSurfer) => void;
}

export default function AudioPlayer({ 
  url = '', 
  isPlaying, 
  onPlayPause,
  currentTime,
  duration,
  onTimeUpdate,
  onDurationChange,
  onWaveSurferReady
}: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#1e293b',
      progressColor: '#fbbf24',
      cursorColor: '#fbbf24',
      barWidth: 2,
      barRadius: 3,
      height: 64,
      normalize: true,
      hideScrollbar: true,
    });

    if (url) {
      ws.load(url);
    }

    ws.on('ready', () => {
      onDurationChange(ws.getDuration());
      onWaveSurferReady?.(ws);
    });

    ws.on('timeupdate', () => {
      onTimeUpdate(ws.getCurrentTime());
    });

    // In v7 'interaction' è il modo per rilevare seek manuali
    ws.on('interaction', () => {
      onTimeUpdate(ws.getCurrentTime());
    });

    waveSurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [url]);

  useEffect(() => {
    if (!waveSurferRef.current) return;
    if (isPlaying) {
      waveSurferRef.current.play();
    } else {
      waveSurferRef.current.pause();
    }
  }, [isPlaying]);

  const changeSpeed = (speed: number) => {
    setPlaybackRate(speed);
    waveSurferRef.current?.setPlaybackRate(speed);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    waveSurferRef.current?.setVolume(val);
  };

  const skip = (seconds: number) => {
    if (!waveSurferRef.current) return;
    waveSurferRef.current.setTime(waveSurferRef.current.getCurrentTime() + seconds);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("glass-strong p-6 border-b border-navy-700/30 shadow-2xl z-10 transition-all relative", !url && "opacity-50 grayscale pointer-events-none")}>
      {!url && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-navy-900/80 backdrop-blur-sm px-4 py-2 border border-navy-700 rounded-xl flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-navy-400" />
            <span className="text-xs font-bold text-navy-300 uppercase tracking-widest">Nessun file audio caricato</span>
          </div>
        </div>
      )}
      <div className="relative group mb-6">
        <div ref={containerRef} className="w-full" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button onClick={() => skip(-10)} className="p-2 rounded-lg hover:bg-navy-800 text-navy-400">
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button 
              onClick={onPlayPause}
              className="w-14 h-14 rounded-2xl bg-gold-500 hover:bg-gold-400 text-navy-950 flex items-center justify-center transition-all shadow-lg shadow-gold-500/20"
            >
              {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
            </button>

            <button onClick={() => skip(10)} className="p-2 rounded-lg hover:bg-navy-800 text-navy-400">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-bold text-white tracking-tighter w-20">{formatTime(currentTime)}</span>
              <span className="text-navy-600 text-sm">/</span>
              <span className="text-navy-500 text-sm font-medium">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-navy-900/80 p-1.5 rounded-xl border border-navy-800">
            {[0.5, 1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                  playbackRate === s ? "bg-gold-500 text-navy-950" : "text-navy-400 hover:text-navy-200"
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 group">
            <Volume2 className="w-5 h-5 text-navy-400" />
            <input 
              type="range" min="0" max="1" step="0.01" value={volume}
              onChange={handleVolumeChange}
              className="w-32 h-1.5 bg-navy-800 rounded-full appearance-none cursor-pointer accent-gold-500"
            />
          </div>
          <button className="p-2.5 rounded-xl hover:bg-navy-800 text-navy-400">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
