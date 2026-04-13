'use client';

import React, { useState, useRef } from 'react';
import { 
  Bell, 
  Upload, 
  Clock, 
  ChevronRight, 
  Plus, 
  MessageSquare, 
  Shield, 
  Send,
  Activity,
  Folder
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Componenti
import Sidebar from '@/components/Sidebar';
import AudioPlayer from '@/components/AudioPlayer';
import TranscriptionView from '@/components/TranscriptionView';
import ChatSidebar from '@/components/ChatSidebar';
import UploadView from '@/components/UploadView';
import TimelineView from '@/components/TimelineView';
import CasesView from '@/components/CasesView';
import SetupView from '@/components/SetupView';

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Refs per WaveSurfer
  const waveSurferRef = useRef<any>(null);

  const handleSeek = (time: number) => {
    if (waveSurferRef.current) {
      waveSurferRef.current.setTime(time);
      setCurrentTime(time);
      setActiveView('player');
    }
  };

  const stats = [
    { label: 'Audio Caricati', value: '47', trend: '+5 questa settimana', icon: Upload },
    { label: 'Ore Trascritte', value: '128h', trend: '+18h questa settimana', icon: Clock },
    { label: 'Fascicoli Attivi', value: '12', trend: '3 con interrogazioni AI', icon: Folder },
    { label: 'Query AI', value: '342', trend: '+67 questa settimana', icon: Activity },
  ];

  return (
    <main className="flex h-screen bg-navy-950 text-white overflow-hidden font-inter">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0D14] relative">
        {/* Header dinamico basato sulla vista */}
        <header className="h-16 border-b border-navy-900/50 flex items-center justify-between px-8 bg-navy-950/50 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-navy-400 uppercase tracking-[0.2em]">
              {activeView === 'dashboard' && 'Dashboard Overview'}
              {activeView === 'upload' && 'Nuova Acquisizione'}
              {activeView === 'player' && 'Player & Trascrizione Forense'}
              {activeView === 'chat' && 'Analisi Conversazionale'}
              {activeView === 'timeline' && 'Timeline Analitica'}
              {activeView === 'cases' && 'Gestione Fascicoli'}
              {activeView === 'setup' && 'Configurazione Sistema'}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-navy-400 uppercase tracking-widest">Supabase Connesso</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-navy-900 transition-colors text-navy-400">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {activeView === 'dashboard' && (
            <div className="flex-1 overflow-y-auto p-8 space-y-10 fade-in">
              {/* Benvenuto */}
              <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-navy-400">
                  Benvenuto, Avvocato
                </h2>
                <p className="text-navy-400 mt-1">
                  Panoramica attività forensi — Ultimo aggiornamento: oggi 18:22
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="glass-card rounded-2xl p-6 border border-navy-700/20 hover:border-gold-500/20 transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center border border-navy-700">
                        <stat.icon className="w-5 h-5 text-gold-500" />
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-navy-500 uppercase tracking-[0.1em]">{stat.label}</p>
                    <p className="text-3xl font-bold text-white my-1">{stat.value}</p>
                    <p className="text-[10px] text-navy-400">{stat.trend}</p>
                  </div>
                ))}
              </div>

              {/* Sezioni Inferiori */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-3xl border border-navy-700/20 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold">Attività Recente</h3>
                    <button className="text-[10px] text-gold-500 font-bold uppercase tracking-widest hover:underline">Vedi tutto →</button>
                  </div>
                  <div className="space-y-6">
                    {[
                      { label: 'Trascrizione completata', sub: 'Intercettazione #142 — Proc. Pen. 4521/2024', time: '10 min fa', icon: 'bg-emerald-500' },
                      { label: 'Query AI — "Cerca riferimenti a denaro contante"', sub: 'Fascicolo: Rossi M. — 12 risultati', time: '32 min fa', icon: 'bg-blue-500' },
                      { label: 'Caricamento audio', sub: 'Verbale udienza 15/01 — In elaborazione', time: '1h fa', icon: 'bg-gold-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group cursor-pointer">
                        <div className={`w-2 h-2 rounded-full ${item.icon}`} />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white group-hover:text-gold-500 transition-colors">{item.label}</p>
                          <p className="text-xs text-navy-500">{item.sub}</p>
                        </div>
                        <span className="text-[10px] text-navy-600 font-mono">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-3xl border border-navy-700/20 p-8">
                  <h3 className="text-lg font-bold mb-8">Azioni Rapide</h3>
                  <div className="space-y-4">
                    <button 
                      onClick={() => setActiveView('upload')}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-navy-900/50 border border-navy-800 hover:border-gold-500/50 hover:bg-navy-800 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
                          <Plus className="w-5 h-5 text-gold-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white group-hover:text-gold-500">Carica Audio</p>
                          <p className="text-[10px] text-navy-500">Nuova intercettazione</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-navy-700 group-hover:text-gold-500" />
                    </button>
                    
                    <button 
                      onClick={() => setActiveView('chat')}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-navy-900/50 border border-navy-800 hover:border-gold-500/50 hover:bg-navy-800 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
                          <MessageSquare className="w-5 h-5 text-gold-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white group-hover:text-gold-500">Interroga AI</p>
                          <p className="text-[10px] text-navy-500">Chat con trascrizioni</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-navy-700 group-hover:text-gold-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'upload' && (
            <UploadView onTranscriptionComplete={() => setActiveView('player')} />
          )}

          {activeView === 'player' && (
            <div className="flex-1 flex flex-col min-w-0 bg-[#0A0D14]">
              <AudioPlayer 
                onWaveSurferReady={(ws) => { waveSurferRef.current = ws; }}
                isPlaying={isPlaying} 
                onPlayPause={() => setIsPlaying(!isPlaying)}
                currentTime={currentTime}
                duration={duration}
                onTimeUpdate={setCurrentTime}
                onDurationChange={setDuration}
              />
              <TranscriptionView 
                currentTime={currentTime} 
                onSeek={handleSeek}
              />
            </div>
          )}

          {activeView === 'chat' && (
            <div className="flex-1 flex flex-col min-w-0 bg-[#0A0D14]">
              <div className="flex-1 overflow-y-auto p-12 space-y-8 max-w-4xl mx-auto w-full scrollbar-hidden">
                <div className="bg-[#121620] border border-navy-800/50 rounded-2xl p-6 flex gap-5">
                  <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-gold-500/20">
                    <Shield className="w-5 h-5 text-navy-950" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-navy-100 leading-relaxed">
                      Analisi completata per il fascicolo **Rossi M.**
                      Ho rilevato 3 segmenti di interesse riguardanti movimentazioni di valuta non dichiarate.
                      Come posso aiutarti a interrogare questi dati?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Estrai importi', 'Identifica date', 'Genera sommario'].map(tag => (
                        <button key={tag} className="px-3 py-1.5 rounded-lg bg-navy-900 text-[10px] font-bold text-navy-400 uppercase tracking-widest border border-navy-800 hover:border-gold-500/30 hover:text-gold-500 transition-all">
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-t from-navy-950/80 to-transparent">
                <div className="max-w-4xl mx-auto relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-500/50 to-navy-500/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-navy-900 border border-navy-700/50 rounded-2xl p-4 flex items-center gap-4">
                    <input 
                      type="text" 
                      placeholder="Fai una domanda all'assistente giuridico..."
                      className="flex-1 bg-transparent border-none text-navy-100 placeholder:text-navy-600 focus:outline-none text-sm px-2"
                    />
                    <button className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/20">
                      <Send className="w-4 h-4 text-navy-950" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'timeline' && (
            <TimelineView onSeek={handleSeek} />
          )}

          {activeView === 'cases' && (
            <CasesView />
          )}

          {activeView === 'setup' && (
            <SetupView />
          )}
        </div>

        {/* Chat Sidebar solo per vistaplayer */}
        {activeView === 'player' && (
          <ChatSidebar />
        )}
      </div>
    </main>
  );
}
