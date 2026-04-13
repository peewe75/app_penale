'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileAudio, CheckCircle2, AlertCircle, Loader2, Play } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function UploadView({ onTranscriptionComplete }: { onTranscriptionComplete: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type.startsWith('audio/') || selectedFile.name.endsWith('.mp3') || selectedFile.name.endsWith('.wav')) {
      setFile(selectedFile);
      startUpload();
    } else {
      alert('Per favore, carica un file audio valido (MP3, WAV, M4A).');
    }
  };

  const startUpload = () => {
    setStatus('uploading');
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        startProcessing();
      }
    }, 150);
  };

  const startProcessing = () => {
    setStatus('processing');
    // Simula l'IA che lavora
    setTimeout(() => {
      setStatus('completed');
    }, 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center fade-in">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Nuova Acquisizione Audio</h2>
          <p className="text-navy-400">Trascrizione forense con identificazione degli speaker e analisi contestuale.</p>
        </div>

        {status === 'idle' && (
          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
            }}
            className={cn(
              "relative group cursor-pointer border-2 border-dashed rounded-3xl p-16 transition-all duration-300 flex flex-col items-center gap-6",
              isDragging 
                ? "border-gold-500 bg-gold-500/5 scale-[1.02]" 
                : "border-navy-700/50 hover:border-gold-500/30 hover:bg-navy-800/10"
            )}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'audio/*';
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files?.[0]) handleFile(target.files[0]);
              };
              input.click();
            }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-500/10 to-gold-700/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Upload className="w-10 h-10 text-gold-500" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-navy-100 mb-1">Trascina qui il file audio</p>
              <p className="text-sm text-navy-500">oppure clicca per selezionarlo dal computer</p>
            </div>
            <div className="flex gap-4 mt-4">
              <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-navy-800 text-navy-400 border border-navy-700">MP3</span>
              <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-navy-800 text-navy-400 border border-navy-700">WAV</span>
              <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-navy-800 text-navy-400 border border-navy-700">M4A</span>
            </div>
          </div>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <div className="glass-card rounded-3xl p-10 border border-navy-700/30 text-center space-y-8">
            <div className="relative w-24 h-24 mx-auto">
              {status === 'processing' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileAudio className="w-12 h-12 text-gold-500" />
                </div>
              )}
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-navy-800"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={276}
                  strokeDashoffset={276 - (276 * progress) / 100}
                  className="text-gold-500 transition-all duration-300"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {status === 'uploading' ? 'Caricamento in corso...' : 'Analisi AI in corso...'}
              </h3>
              <p className="text-navy-400 text-sm max-w-xs mx-auto">
                {status === 'uploading' 
                  ? `Stiamo trasmettendo "${file?.name}" ai nostri server sicuri.` 
                  : 'L\'intelligenza artificiale sta trascrivendo l\'audio e identificando gli interlocutori.'}
              </p>
            </div>

            {status === 'processing' && (
              <div className="flex justify-center gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse" 
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {status === 'completed' && (
          <div className="glass-card rounded-3xl p-10 border border-navy-700/30 text-center space-y-8 fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Trascrizione Pronta</h3>
              <p className="text-navy-400 text-sm">
                Il file "{file?.name}" è stato elaborato con successo. 
                Sono stati identificati 2 speaker e 19 segmenti.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setStatus('idle')}
                className="px-6 py-2.5 rounded-xl border border-navy-700 text-navy-300 hover:bg-navy-800 transition-all font-medium"
              >
                Nuovo Caricamento
              </button>
              <button 
                onClick={onTranscriptionComplete}
                className="px-8 py-2.5 rounded-xl bg-gold-500 text-navy-950 hover:bg-gold-400 transition-all font-bold flex items-center gap-2 shadow-lg shadow-gold-500/20"
              >
                <Play className="w-4 h-4 fill-current" />
                Vedi Risultati
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 flex items-center justify-center gap-8 opacity-50">
          <div className="flex items-center gap-2 text-[10px] text-navy-400 font-bold uppercase tracking-widest">
            <AlertCircle className="w-3 h-3" />
            Crittografia AES-256
          </div>
          <div className="flex items-center gap-2 text-[10px] text-navy-400 font-bold uppercase tracking-widest">
            <AlertCircle className="w-3 h-3" />
            Privacy Forense
          </div>
          <div className="flex items-center gap-2 text-[10px] text-navy-400 font-bold uppercase tracking-widest">
            <AlertCircle className="w-3 h-3" />
            Server in Italia
          </div>
        </div>
      </div>
    </div>
  );
}
