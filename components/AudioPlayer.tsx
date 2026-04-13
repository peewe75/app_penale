'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  Clock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AudioPlayerProps {
  url: string;
  onTimeUpdate?: (time: number) => void;
  onReady?: (duration: number) => void;
}

export default function AudioPlayer({ url, onTimeUpdate, onReady }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#334e68',
      progressColor: '#fbbf24',
      cursorColor: '#fbbf24',
      barWidth: 2,
      barRadius: 3,
      responsive: true,
      height: 60,
      normalize: true,
      partialRender: true,
    });

    ws.load(url);

    ws.on('ready', () => {
      setDuration(ws.getDuration());
      onReady?.(ws.getDuration());
    });

    ws.on('audioprocess', () => {
      const time = ws.getCurrentTime();
      setCurrentTime(time);
      onTimeUpdate?.(time);
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));

    waveSurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [url, onTimeUpdate, onReady]);

  const togglePlay = useCallback(() => {
    waveSurferRef.current?.playPause();
  }, []);

  const changeSpeed = (speed: number) => {
    setPlaybackRate(speed);
    waveSurferRef.current?.setPlaybackRate(speed);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    waveSurferRef.current?.setVolume(val);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="waveform-container glass-strong p-4 border-b border-navy-700/30">
      {/* Waveform Area */}
      <div ref={containerRef} className="w-full mb-4" />

      {/* Controls Area */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button 
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-950 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-gold-500/20"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
          </button>

          {/* Time Display */}
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-gold-500" id="currentTime">{formatTime(currentTime)}</span>
            <span className="text-navy-600">/</span>
            <span className="text-navy-400">{formatTime(duration)}</span>
          </div>

          {/* Speed Controls */}
          <div className="flex items-center gap-1 bg-navy-900/50 p-1 rounded-lg border border-navy-700/30 ml-2">
            {[0.5, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono transition-all",
                  playbackRate === s 
                    ? "bg-gold-500/20 text-gold-500 border border-gold-500/30" 
                    : "text-navy-400 hover:bg-navy-700/50"
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-navy-400" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
            />
          </div>

          {/* Additional Actions */}
          <div className="flex items-center gap-1 border-l border-navy-700/30 pl-4 h-6">
            <button className="p-1.5 rounded hover:bg-navy-700/30 text-navy-400 transition-colors">
              <Clock className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded hover:bg-navy-700/30 text-navy-400 transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
