'use client';

import React from 'react';
import { Folder, FileAudio, Search, Plus, Filter, MoreVertical, Calendar, User, Shield } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const cases = [
  {
    id: '4521/2024',
    title: 'Proc. Pen. Rossi Marco + altri',
    status: 'In corso',
    files: 14,
    lastUpdate: '2 ore fa',
    client: 'Rossi Marco',
    category: 'Reati Finanziari'
  },
  {
    id: '1288/2023',
    title: 'Indagine S.p.A. Logistica',
    status: 'Completato',
    files: 28,
    lastUpdate: 'ieri 15:30',
    client: 'G. Bianchi (AD)',
    category: 'Corruzione'
  },
  {
    id: '3310/2024',
    title: 'Incidente Probatorio — Procura Roma',
    status: 'In attesa',
    files: 3,
    lastUpdate: '3 giorni fa',
    client: 'V. Esposito',
    category: 'Associazione'
  }
];

export default function CasesView() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-navy-950/20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Fascicoli Digitali</h2>
            <p className="text-navy-400 text-sm">Gestione centralizzata dell'evidenza audio e trascrizioni.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-500 text-navy-950 hover:bg-gold-400 transition-all font-bold shadow-lg shadow-gold-500/20">
            <Plus className="w-5 h-5" />
            Nuovo Fascicolo
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
            <input 
              type="text" 
              placeholder="Cerca per numero proc., nome cliente o categoria..."
              className="w-full bg-navy-900/50 border border-navy-700/30 rounded-xl py-3 pl-12 pr-4 text-sm text-navy-100 placeholder:text-navy-600 focus:outline-none focus:border-gold-500/50 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl glass border border-navy-700/30 text-navy-300 hover:text-white transition-all text-sm">
            <Filter className="w-4 h-4" />
            Filtra
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((caseItem) => (
            <div 
              key={caseItem.id}
              className="glass-card rounded-2xl p-6 border border-navy-700/10 hover:border-navy-700/40 transition-all group cursor-pointer relative overflow-hidden"
            >
              {/* Status Indicator */}
              <div className={cn(
                "absolute top-0 right-0 px-4 py-1 text-[8px] font-bold uppercase tracking-widest rounded-bl-xl",
                caseItem.status === 'In corso' ? "bg-gold-500/20 text-gold-500" : 
                caseItem.status === 'Completato' ? "bg-emerald-500/20 text-emerald-500" : "bg-navy-700/50 text-navy-400"
              )}>
                {caseItem.status}
              </div>

              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-navy-800 flex items-center justify-center border border-navy-700 group-hover:bg-navy-700 transition-colors">
                  <Folder className="w-6 h-6 text-gold-500" />
                </div>
                <button className="p-1 rounded hover:bg-navy-800 text-navy-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-navy-500 uppercase tracking-widest mb-1">Proc. n. {caseItem.id}</p>
                  <h3 className="text-lg font-bold text-white group-hover:text-gold-500 transition-colors leading-tight">{caseItem.title}</h3>
                </div>

                <div className="pt-4 border-t border-navy-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-navy-400">
                    <User className="w-3.5 h-3.5" />
                    <span>Cliente: <span className="text-navy-200">{caseItem.client}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-navy-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Ambito: <span className="text-navy-200 font-medium">{caseItem.category}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-navy-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Ultimo agg: {caseItem.lastUpdate}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileAudio className="w-4 h-4 text-gold-500" />
                    <span className="text-sm font-bold text-white">{caseItem.files}</span>
                    <span className="text-xs text-navy-500">audio</span>
                  </div>
                  <button className="text-[10px] text-gold-500 uppercase tracking-widest font-bold hover:underline">Apri Fascicolo</button>
                </div>
              </div>
            </div>
          ))}

          {/* New Case Placeholder */}
          <div className="border-2 border-dashed border-navy-700/30 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-gold-500/30 hover:bg-navy-800/10 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-navy-900 border border-navy-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-navy-600 group-hover:text-gold-500" />
            </div>
            <p className="text-sm font-bold text-navy-500 group-hover:text-navy-300">Nuovo Procedimento</p>
          </div>
        </div>
      </div>
    </div>
  );
}
