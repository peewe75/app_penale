'use client';

import React, { useState } from 'react';
import { Cpu, Database, Key, Bell, Check, CreditCard, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const aiEngines = [
  { name: 'LegalWhisp v4', desc: 'Ottimizzato per dialetti e rumore di fondo.', speed: 'Lento (HQ)', cost: '3 crediti/min' },
  { name: 'Forensic Turbo', desc: 'Trascrizione ultra-veloce quasi istantanea.', speed: 'Rapido', cost: '1 credito/min' }
];

export default function SetupView() {
  const [activeTab, setActiveTab] = useState<'ai' | 'security' | 'billing'>('ai');
  const [selectedEngine, setSelectedEngine] = useState(aiEngines[0].name);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-navy-950/20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Configurazione & Pipeline</h2>
            <p className="text-navy-400 text-sm">Personalizza i motori AI e gestisci la sicurezza dei dati.</p>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-navy-900/50 border border-navy-800 rounded-xl mb-10 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={cn(
              'flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all',
              activeTab === 'ai' ? 'bg-navy-800 text-gold-500 shadow-lg shadow-black/20' : 'text-navy-500 hover:text-navy-300'
            )}
          >
            <Cpu className="w-4 h-4" /> AI Engine
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={cn(
              'flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all',
              activeTab === 'security' ? 'bg-navy-800 text-gold-500 shadow-lg shadow-black/20' : 'text-navy-500 hover:text-navy-300'
            )}
          >
            <Database className="w-4 h-4" /> Security
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={cn(
              'flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all',
              activeTab === 'billing' ? 'bg-navy-800 text-gold-500 shadow-lg shadow-black/20' : 'text-navy-500 hover:text-navy-300'
            )}
          >
            <CreditCard className="w-4 h-4" /> Billing
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'ai' && (
            <>
              <div className="glass-card rounded-2xl p-8 border border-navy-700/20 space-y-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Motore di Trascrizione</h3>
                    <p className="text-sm text-navy-400">Seleziona il modello AI ottimizzato per il tuo caso.</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                    Sincronizzato
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiEngines.map((engine) => (
                    <button
                      key={engine.name}
                      type="button"
                      onClick={() => setSelectedEngine(engine.name)}
                      className={cn(
                        'p-5 rounded-xl border cursor-pointer transition-all text-left',
                        selectedEngine === engine.name
                          ? 'border-gold-500/50 bg-gold-500/5'
                          : 'border-navy-700/30 bg-navy-900/40 hover:border-navy-600'
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-white">{engine.name}</span>
                        {selectedEngine === engine.name && <Check className="w-4 h-4 text-gold-500" />}
                      </div>
                      <p className="text-xs text-navy-400 mb-4">{engine.desc}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-navy-800">
                        <span className="text-[10px] text-navy-500 uppercase tracking-widest">{engine.speed}</span>
                        <span className="text-[10px] text-gold-500 font-bold uppercase tracking-widest">{engine.cost}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-8 border border-navy-700/20 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-navy-800 flex items-center justify-center border border-navy-700">
                    <Zap className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Aggiornamenti in tempo reale</h3>
                    <p className="text-sm text-navy-400">L'IA apprende dalle correzioni manuali salvate nel fascicolo.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLiveUpdatesEnabled((prev) => !prev)}
                  className={cn('w-12 h-6 rounded-full relative transition-colors', liveUpdatesEnabled ? 'bg-gold-500' : 'bg-navy-700')}
                  aria-pressed={liveUpdatesEnabled}
                  aria-label="Attiva o disattiva aggiornamenti in tempo reale"
                >
                  <div className={cn('absolute top-1 w-4 h-4 bg-navy-950 rounded-full transition-all', liveUpdatesEnabled ? 'right-1' : 'left-1')} />
                </button>
              </div>
            </>
          )}

          {activeTab === 'billing' && (
            <div className="glass-card rounded-2xl p-10 border border-navy-700/20 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-navy-800 flex items-center justify-center mx-auto border border-navy-700 mb-2">
                <CreditCard className="w-8 h-8 text-gold-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Crediti Residui: 1.250</h3>
                <p className="text-navy-400 text-sm">Equivalenti a circa 21 ore di trascrizione HQ.</p>
              </div>
              <a
                href="https://console.firebase.google.com/project/legal-ai-penale/usage/details"
                target="_blank"
                rel="noreferrer"
                className="inline-flex px-10 py-3 rounded-xl bg-gold-500 text-navy-950 hover:bg-gold-400 transition-all font-bold shadow-lg shadow-gold-500/20 mx-auto"
              >
                Apri Billing Firebase
              </a>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              {[
                { label: 'Doppia Crittografia', status: 'Attivo', icon: Key },
                { label: 'Logs di Accesso Forense', status: 'Attivo', icon: Database },
                { label: 'Notifiche Sicurezza', status: 'Disattivo', icon: Bell }
              ].map((item) => (
                <div key={item.label} className="glass-card rounded-2xl p-6 border border-navy-700/20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <item.icon className="w-5 h-5 text-navy-500" />
                    <span className="text-base font-medium text-navy-100">{item.label}</span>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-bold uppercase tracking-widest',
                      item.status === 'Attivo' ? 'text-emerald-500' : 'text-navy-500'
                    )}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
