'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AudioPlayer from '@/components/AudioPlayer';
import TranscriptionView from '@/components/TranscriptionView';
import ChatSidebar from '@/components/ChatSidebar';
import { 
  BarChart3, 
  Clock, 
  Files, 
  MessageSquare, 
  Play, 
  Plus, 
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper per classi CSS
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- MOCK DATA ---
const segmentsData = [
  { id: 1, time: 0.0, end: 16.4, speaker: 'Rossi M.', text: 'Allora, ascolta bene. La situazione è delicata. Abbiamo bisogno di muoverci con cautela su questo fronte.' },
  { id: 2, time: 16.4, end: 33.2, speaker: 'Ind. Ignoto 1', text: 'Capisco. Ma i tempi sono stretti. Se non agiamo entro la fine del mese, perdiamo tutto.' },
  { id: 3, time: 33.2, end: 60.0, speaker: 'Rossi M.', text: 'Lo so, lo so. Ma non possiamo permetterci errori. L\'ultima operazione è già stata compromessa. Ho visto i conti — ci sono movimenti sospetti che non possiamo giustificare.' },
  { id: 4, time: 60.0, end: 86.0, speaker: 'Ind. Ignoto 1', text: 'Quei movimenti li ho gestiti io. Sono transitati attraverso la società di comodo a Lugano. Nessuno dovrebbe poterli rintracciare.' },
  { id: 5, time: 86.0, end: 123.0, speaker: 'Rossi M.', text: 'Dovrebbe? "Dovrebbe" non mi basta più. Dopo quello che è successo con la Guardia di Finanza, voglio certezze. Hai parlato con il commercialista?' },
  { id: 6, time: 123.0, end: 156.0, speaker: 'Ind. Ignoto 1', text: 'Sì, ieri sera. Ha detto che la documentazione è pulita. Almeno in superficie. Ma se qualcuno scava in profondità...' },
  { id: 7, time: 156.0, end: 190.0, speaker: 'Rossi M.', text: 'Non devono scavare. Punto. Dobbiamo consolidare la posizione e chiudere questa fase. Per la prossima operazione, voglio un canale diverso.' },
  { id: 8, time: 190.0, end: 218.0, speaker: 'Ind. Ignoto 1', text: 'Va bene. Ma ci serviranno più liquidità. Almeno 200mila per le nuove strutture.' },
  { id: 9, time: 218.0, end: 248.0, speaker: 'Rossi M.', text: '200mila? E da dove li prendiamo? L\'ultima tranche non è ancora arrivata dal cliente principale.' },
  { id: 10, time: 248.0, end: 275.0, speaker: 'Ind. Ignoto 1', text: 'Il cliente ha promesso per venerdì. Ha detto che i fondi sono già in movimento. Basta che aspettiamo 48 ore.' },
  { id: 11, time: 275.0, end: 310.0, speaker: 'Rossi M.', text: 'Promesse. Sempre promesse. Senti, organizziamo un incontro di persona. Non mi fido più a parlare di queste cose al telefono. Martedì sera, al solito posto.' },
  { id: 12, time: 310.0, end: 335.0, speaker: 'Ind. Ignoto 1', text: 'D\'accordo. Martedì alle 21. Porta i documenti della società nuova. Voglio verificare tutto prima di procedere.' },
  { id: 13, time: 335.0, end: 365.0, speaker: 'Rossi M.', text: 'Li ho già preparati. C\'è anche il piano B, nel caso in cui il primo canale si chiuda. Ho previsto tre percorsi alternativi per i fondi.' },
  { id: 14, time: 365.0, end: 395.0, speaker: 'Ind. Ignoto 1', text: 'Bene. Un\'ultima cosa — quel giudice che sta seguendo l\'istruttoria preliminare. Lo conosci?' },
  { id: 15, time: 395.0, end: 430.0, speaker: 'Rossi M.', text: 'Il Dott. Ferretti? Sì, purtroppo. È uno di quelli rigorosi. Ma ho sentito che ha dei problemi personali. Magari possiamo usare quella leva, se serve.' },
  { id: 16, time: 430.0, end: 455.0, speaker: 'Ind. Ignoto 1', text: 'No, no. Niente leva. Troppo rischioso. Se venisse fuori che abbiamo fatto pressione su un giudice, saremmo finiti. Meglio lavorare sulla difesa tecnica.' },
  { id: 17, time: 455.0, end: 490.0, speaker: 'Rossi M.', text: 'Hai ragione. L\'avvocato è già stato istruito. Sta preparando una memoria difensiva che metta in dubbio la validità delle intercettazioni. Sembra promettente.' },
  { id: 18, time: 490.0, end: 505.0, speaker: 'Ind. Ignoto 1', text: 'Ottimo. Allora ci vediamo martedì. E ricordi: niente telefonate fino ad allora.' },
  { id: 19, time: 505.0, end: 512.0, speaker: 'Rossi M.', text: 'Niente telefonate. D\'accordo. Chiudo ora. A martedì.' }
];

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  // Mock audio URL (usa peaks se possibile, ma qui mettiamo un segnaposto)
  const audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  return (
    <div className="flex h-screen bg-[#0a1929] overflow-hidden text-[#d9e2ec]">
      {/* Sidebar Desktop */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header 
          currentView={activeView} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex">
          {activeView === 'dashboard' && <DashboardView onSwitchView={setActiveView} />}
          
          {activeView === 'player' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <AudioPlayer 
                url={audioUrl} 
                onTimeUpdate={setCurrentTime} 
              />
              <TranscriptionView 
                segments={segmentsData} 
                currentTime={currentTime}
                onSeek={(time) => {
                  // In un'app reale, passeremmo un ref a Wavesurfer
                  // Per ora, simuliamo il comportamento
                  console.log('Seeking to:', time);
                }}
              />
            </div>
          )}

          {activeView === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-1">Chat Analitica</h2>
                <p className="text-navy-400 text-sm">Interroga le trascrizioni con precisione forense.</p>
              </div>
              <div className="flex-1 flex items-center justify-center text-navy-500 italic">
                Seleziona una trascrizione nel pannello laterale per iniziare...
              </div>
            </div>
          )}

          {/* Chat Sidebar (sempre visibile o condizionale) */}
          {(activeView === 'player' || activeView === 'chat') && <ChatSidebar />}
          
          {/* Placeholder per le altre viste */}
          {!['dashboard', 'player', 'chat'].includes(activeView) && (
            <div className="flex-1 flex items-center justify-center p-10 text-center">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Vista in fase di migrazione</h2>
                <p className="text-navy-400 max-w-md">Questa sezione del prototipo LegalAI è attualmente in fase di implementazione in React.</p>
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className="mt-6 px-6 py-2 rounded-lg bg-navy-800 border border-navy-700 text-gold-500 hover:bg-navy-700 transition-all"
                >
                  Torna alla Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS (Dashboard) ---

function DashboardView({ onSwitchView }: { onSwitchView: (v: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 fade-in">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Benvenuto, Avvocato</h2>
        <p className="text-navy-400 text-sm">Panoramica attività forensi — Ultimo aggiornamento: oggi 18:22</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Audio Caricati" value="47" trend="+5 questa settimana" icon={Files} color="gold" />
        <StatCard label="Ore Trascritte" value="128h" trend="+18h questa settimana" icon={Clock} color="emerald" />
        <StatCard label="Fascicoli Attivi" value="12" trend="3 con interrogazioni AI" icon={FileText} color="blue" />
        <StatCard label="Query AI" value="342" trend="+67 questa settimana" icon={TrendingUp} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 border border-navy-700/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Attività Recente</h3>
            <button className="text-xs text-gold-500 hover:underline">Vedi tutto →</button>
          </div>
          <div className="space-y-4">
            <ActivityItem 
              title="Trascrizione completata" 
              subtitle="Intercettazione #142 — Proc. Pen. 4521/2024" 
              time="10 min fa" 
              color="emerald" 
              onClick={() => onSwitchView('player')}
            />
            <ActivityItem 
              title='Query AI — "Cerca riferimenti a denaro contante"' 
              subtitle="Fascicolo: Rossi M. — 12 risultati" 
              time="32 min fa" 
              color="blue" 
            />
            <ActivityItem 
              title="Caricamento audio" 
              subtitle="Verbale udienza 15/01 — In elaborazione" 
              time="1h fa" 
              color="gold" 
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-xl p-5 border border-navy-700/20">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Azioni Rapide</h3>
          <div className="space-y-3">
            <QuickActionButton 
              title="Carica Audio" 
              subtitle="Nuova intercettazione" 
              icon={Plus} 
              onClick={() => onSwitchView('upload')}
            />
            <QuickActionButton 
              title="Interroga AI" 
              subtitle="Chat con trascrizioni" 
              icon={MessageSquare} 
              onClick={() => onSwitchView('chat')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon: Icon, color }: any) {
  const colors = {
    gold: "text-gold-500 bg-gold-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    purple: "text-purple-500 bg-purple-500/10",
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-navy-700/10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-navy-400 uppercase tracking-widest">{label}</span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors[color as keyof typeof colors])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-[10px] text-navy-500">{trend}</p>
    </div>
  );
}

function ActivityItem({ title, subtitle, time, color, onClick }: any) {
  const dotColors = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    gold: "bg-gold-500",
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg hover:bg-navy-700/20 transition-all cursor-pointer border border-transparent hover:border-navy-700/30 group",
        onClick && "cursor-pointer"
      )}
    >
      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", dotColors[color as keyof typeof dotColors])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-navy-100 group-hover:text-gold-500 transition-colors">{title}</p>
        <p className="text-xs text-navy-500">{subtitle}</p>
      </div>
      <span className="text-[10px] text-navy-600 font-mono">{time}</span>
    </div>
  );
}

function QuickActionButton({ title, subtitle, icon: Icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-xl glass hover:bg-navy-700/50 border border-navy-700/30 hover:border-gold-500/30 transition-all group"
    >
      <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
        <Icon className="w-5 h-5 text-gold-500" />
      </div>
      <div className="text-left">
        <p className="text-sm font-bold text-navy-100">{title}</p>
        <p className="text-[10px] text-navy-500 uppercase tracking-wider">{subtitle}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-navy-600 ml-auto group-hover:text-gold-500 transition-colors" />
    </button>
  );
}
