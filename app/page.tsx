'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Upload,
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

import Sidebar from '@/components/Sidebar';
import AudioPlayer from '@/components/AudioPlayer';
import TranscriptionView from '@/components/TranscriptionView';
import ChatSidebar from '@/components/ChatSidebar';
import UploadView from '@/components/UploadView';
import TimelineView from '@/components/TimelineView';
import CasesView from '@/components/CasesView';
import { useAppContext } from '@/lib/context/AppContext';
import SetupView from '@/components/SetupView';
import type { CaseData } from '@/lib/api/cases';
import { getSegmentsByCaseId, type SegmentData } from '@/lib/api/transcripts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const promptChips = [
  'Estrai importi monetari',
  'Riepiloga udienze',
  'Trova nomi non in rubrica'
];

export default function Home() {
  const { cases, activeCase, activeCaseId } = useAppContext();
  const [activeView, setActiveView] = useState('dashboard');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatResponding, setIsChatResponding] = useState(false);
  const [chatSegments, setChatSegments] = useState<SegmentData[]>([]);

  const waveSurferRef = useRef<any>(null);

  // Carica i segmenti del fascicolo attivo per la chat principale
  useEffect(() => {
    if (!activeCaseId) {
      setChatSegments([]);
      return;
    }
    let cancelled = false;
    getSegmentsByCaseId(activeCaseId).then((data) => {
      if (!cancelled) setChatSegments(data);
    });
    return () => {
      cancelled = true;
    };
  }, [activeCaseId]);

  // Reset della chat quando cambia fascicolo
  useEffect(() => {
    setChatMessages([]);
  }, [activeCaseId]);

  const handleSeek = (time: number) => {
    if (waveSurferRef.current) {
      waveSurferRef.current.setTime(time);
      setCurrentTime(time);
      setActiveView('player');
    }
  };

  const openCaseView = (caseItem: CaseData) => {
    setActiveView(caseItem.audioUrl ? 'player' : 'upload');
  };

  const handlePromptClick = (prompt: string) => {
    setActiveView('chat');
    setChatInput(prompt);
  };

  const handleChatSend = async () => {
    const prompt = chatInput.trim();
    if (!prompt || isChatResponding) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: prompt
    };

    const nextMessages = [...chatMessages, userMessage];
    setChatMessages(nextMessages);
    setChatInput('');
    setIsChatResponding(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          segments: chatSegments.map((s) => ({
            time: s.time,
            end: s.end,
            speaker: s.speaker,
            text: s.text
          })),
          caseTitle: activeCase?.title
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(err.error || 'Errore sconosciuto.');
      }

      const data = await response.json();
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: data.reply || '(Risposta vuota.)'
        }
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant-error`,
          role: 'assistant',
          content: `Errore nella chiamata AI: ${err?.message || 'riprova più tardi.'}`
        }
      ]);
    } finally {
      setIsChatResponding(false);
    }
  };

  const stats = [
    {
      label: 'Audio Caricati',
      value: cases.reduce((acc, c) => acc + (c.audioCount || 0), 0).toString(),
      trend: 'Caricati su Supabase',
      icon: Upload
    },
    {
      label: 'Fascicoli Attivi',
      value: cases.length.toString(),
      trend: cases.length > 0 ? 'Pronti per consultazione' : 'Crea il primo fascicolo',
      icon: Folder
    },
    { label: 'Query AI', value: 'Ready', trend: 'Sistema pronto', icon: Activity }
  ];

  return (
    <main className="flex h-screen bg-navy-950 text-white overflow-hidden font-inter">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0D14] relative">
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
            {activeCase && (
              <span className="px-3 py-1 bg-gold-500/10 text-gold-500 border border-gold-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest hidden sm:inline-block">
                Fascicolo Attivo: {activeCase.procedureNumber || activeCase.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-navy-400 uppercase tracking-widest">BCS & AI Connessi</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('setup')}
              className="p-2 rounded-lg hover:bg-navy-900 transition-colors text-navy-400"
              aria-label="Apri configurazione sistema"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {activeView === 'dashboard' && (
            <div className="flex-1 overflow-y-auto p-8 space-y-10 fade-in">
              <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-navy-400">
                  Benvenuto, Avvocato
                </h2>
                <p className="text-navy-400 mt-1">Panoramica operativa del fascicolo digitale.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-3xl border border-navy-700/20 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold">Attivita Recente</h3>
                    <button
                      type="button"
                      onClick={() => setActiveView(cases.length > 0 ? 'cases' : 'upload')}
                      className="text-[10px] text-gold-500 font-bold uppercase tracking-widest hover:underline"
                    >
                      Vedi Tutto {'->'}
                    </button>
                  </div>
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-navy-900 border border-navy-800 mb-4 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-navy-600" />
                    </div>
                    <p className="text-sm font-bold text-navy-300">Nessuna attivita registrata</p>
                    <p className="text-xs text-navy-500 mt-1 max-w-[220px]">
                      Le acquisizioni e gli eventi recenti compariranno qui dopo il primo caricamento.
                    </p>
                  </div>
                </div>

                <div className="glass-card rounded-3xl border border-navy-700/20 p-8">
                  <h3 className="text-lg font-bold mb-8">Azioni Rapide</h3>
                  <div className="space-y-4">
                    <button
                      type="button"
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
                      type="button"
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

          {activeView === 'upload' && <UploadView onTranscriptionComplete={() => setActiveView('player')} />}

          {activeView === 'player' && (
            <div className="flex-1 flex flex-col min-w-0 bg-[#0A0D14]">
              <AudioPlayer
                url={activeCase?.audioUrl || undefined}
                onWaveSurferReady={(ws) => {
                  waveSurferRef.current = ws;
                }}
                isPlaying={isPlaying}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                currentTime={currentTime}
                duration={duration}
                onTimeUpdate={setCurrentTime}
                onDurationChange={setDuration}
              />
              <TranscriptionView currentTime={currentTime} onSeek={handleSeek} />
            </div>
          )}

          {activeView === 'chat' && (
            <div className="flex-1 flex flex-col min-w-0 bg-[#0A0D14]">
              <div className="flex-1 overflow-y-auto p-12 space-y-8 max-w-4xl mx-auto w-full scrollbar-hidden">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500">
                      <Shield className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Assistente Giuridico Pronto</h3>
                      <p className="text-navy-400 max-w-md mx-auto text-sm mt-2">
                        Fai una domanda per analizzare un fascicolo o estrarre informazioni operative dalle trascrizioni.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      {promptChips.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handlePromptClick(tag)}
                          className="px-3 py-1.5 rounded-lg bg-navy-900 text-[10px] font-bold text-navy-400 uppercase tracking-widest border border-navy-800 hover:border-gold-500/30 hover:text-gold-500 transition-all"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'rounded-2xl p-4 border max-w-2xl',
                          message.role === 'assistant'
                            ? 'bg-navy-900/50 border-navy-800 text-navy-100'
                            : 'bg-gold-500/10 border-gold-500/20 text-white ml-auto'
                        )}
                      >
                        <p className="text-xs font-bold uppercase tracking-widest mb-2 text-navy-400">
                          {message.role === 'assistant' ? 'Assistente' : 'Utente'}
                        </p>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    ))}
                    {isChatResponding && (
                      <div className="rounded-2xl p-4 border bg-navy-900/50 border-navy-800 text-navy-100 max-w-2xl">
                        <p className="text-sm">Sto analizzando il fascicolo...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-8 bg-gradient-to-t from-navy-950/80 to-transparent">
                <div className="max-w-4xl mx-auto relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-500/50 to-navy-500/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                  <div className="relative bg-navy-900 border border-navy-700/50 rounded-2xl p-4 flex items-center gap-4">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleChatSend();
                        }
                      }}
                      placeholder="Fai una domanda all'assistente giuridico..."
                      className="flex-1 bg-transparent border-none text-navy-100 placeholder:text-navy-600 focus:outline-none text-sm px-2"
                      aria-label="Domanda all'assistente giuridico"
                    />
                    <button
                      type="button"
                      onClick={handleChatSend}
                      disabled={!chatInput.trim() || isChatResponding}
                      className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/20 disabled:opacity-50 disabled:hover:bg-gold-500"
                      aria-label="Invia domanda all'assistente"
                    >
                      <Send className="w-4 h-4 text-navy-950" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'timeline' && <TimelineView onSeek={handleSeek} />}

          {activeView === 'cases' && <CasesView onOpenCase={openCaseView} />}

          {activeView === 'setup' && <SetupView />}
        </div>

        {activeView === 'player' && <ChatSidebar />}
      </div>
    </main>
  );
}
