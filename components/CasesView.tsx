'use client';

import React, { useState } from 'react';
import { Folder, FileAudio, Search, Plus, Filter, MoreVertical, Calendar, User, Shield, X, Loader2 } from 'lucide-react';
import { useAppContext } from '@/lib/context/AppContext';
import { createCase, type CaseData } from '@/lib/api/cases';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CasesViewProps {
  onOpenCase: (caseItem: CaseData) => void;
}

type StatusFilter = 'all' | 'active' | 'archived' | 'pending';

export default function CasesView({ onOpenCase }: CasesViewProps) {
  const { cases, activeCaseId, setActiveCaseId, refreshCases, isLoadingCases } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [formData, setFormData] = useState({
    title: '',
    procedure: '',
    client: '',
    category: 'penale' as CaseData['category']
  });

  const statusOptions: Array<{ id: StatusFilter; label: string }> = [
    { id: 'all', label: 'Tutti' },
    { id: 'active', label: 'In Corso' },
    { id: 'pending', label: 'In Attesa' },
    { id: 'archived', label: 'Archiviati' }
  ];

  const filteredCases = cases.filter((caseItem) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      caseItem.title.toLowerCase().includes(query) ||
      caseItem.client.toLowerCase().includes(query) ||
      caseItem.category.toLowerCase().includes(query) ||
      caseItem.procedureNumber.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newCase: Omit<CaseData, 'id' | 'createdAt' | 'lastUpdate'> = {
      title: formData.title,
      procedureNumber: formData.procedure,
      client: formData.client,
      category: formData.category,
      status: 'active'
    };

    try {
      const newCaseId = await createCase(newCase);
      await refreshCases();
      setActiveCaseId(newCaseId);
      setIsModalOpen(false);
      setFormData({ title: '', procedure: '', client: '', category: 'penale' });
      onOpenCase({ ...newCase, id: newCaseId, audioCount: 0 });
    } catch (error) {
      alert('Errore nella creazione del fascicolo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-navy-950/20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Fascicoli Digitali</h2>
            <p className="text-navy-400 text-sm">Gestione centralizzata dell'evidenza audio e trascrizioni.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-500 text-navy-950 hover:bg-gold-400 transition-all font-bold shadow-lg shadow-gold-500/20"
            aria-label="Crea un nuovo fascicolo"
          >
            <Plus className="w-5 h-5" />
            Nuovo Fascicolo
          </button>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
            <input
              type="text"
              name="caseSearch"
              autoComplete="off"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per numero proc., nome cliente o categoria..."
              className="w-full bg-navy-900/50 border border-navy-700/30 rounded-xl py-3 pl-12 pr-4 text-sm text-navy-100 placeholder:text-navy-600 focus:outline-none focus:border-gold-500/50 transition-all"
              aria-label="Cerca fascicoli"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setStatusFilter(option.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                  statusFilter === option.id
                    ? 'border-gold-500/40 bg-gold-500/10 text-gold-500'
                    : 'border-navy-700/30 bg-navy-900/30 text-navy-300 hover:text-white hover:border-navy-600'
                )}
              >
                <Filter className="w-4 h-4" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {isLoadingCases ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          </div>
        ) : filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((caseItem) => (
              <div
                key={caseItem.id}
                onClick={() => setActiveCaseId(caseItem.id!)}
                className={cn(
                  'glass-card rounded-2xl p-6 border transition-all group cursor-pointer relative overflow-hidden',
                  activeCaseId === caseItem.id
                    ? 'border-gold-500/40 shadow-[0_0_0_1px_rgba(212,175,55,0.15)]'
                    : 'border-navy-700/10 hover:border-navy-700/40'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0 right-0 px-4 py-1 text-[8px] font-bold uppercase tracking-widest rounded-bl-xl',
                    caseItem.status === 'active'
                      ? 'bg-gold-500/20 text-gold-500'
                      : caseItem.status === 'archived'
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-navy-700/50 text-navy-400'
                  )}
                >
                  {caseItem.status === 'active' ? 'In corso' : caseItem.status === 'archived' ? 'Archiviato' : 'In attesa'}
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-navy-800 flex items-center justify-center border border-navy-700 group-hover:bg-navy-700 transition-colors">
                    <Folder className="w-6 h-6 text-gold-500" />
                  </div>
                  <span className="p-1 rounded text-navy-600" aria-hidden="true">
                    <MoreVertical className="w-4 h-4" />
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-navy-500 uppercase tracking-widest mb-1">
                      Proc. n. {caseItem.procedureNumber}
                    </p>
                    <h3 className="text-lg font-bold text-white group-hover:text-gold-500 transition-colors leading-tight">
                      {caseItem.title}
                    </h3>
                  </div>

                  <div className="pt-4 border-t border-navy-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-navy-400">
                      <User className="w-3.5 h-3.5" />
                      <span>
                        Cliente: <span className="text-navy-200">{caseItem.client}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-navy-400">
                      <Shield className="w-3.5 h-3.5" />
                      <span>
                        Ambito: <span className="text-navy-200 font-medium">{caseItem.category}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-navy-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Ultimo agg: {caseItem.lastUpdate?.toDate?.()?.toLocaleDateString() || 'Oggi'}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FileAudio className="w-4 h-4 text-gold-500" />
                      <span className="text-sm font-bold text-white">{caseItem.audioCount || 0}</span>
                      <span className="text-xs text-navy-500">audio</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCaseId(caseItem.id!);
                        onOpenCase(caseItem);
                      }}
                      className="text-[10px] text-gold-500 uppercase tracking-widest font-bold hover:underline"
                      aria-label={`Apri il fascicolo ${caseItem.title}`}
                    >
                      Apri Fascicolo
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div
              onClick={() => setIsModalOpen(true)}
              className="border-2 border-dashed border-navy-700/30 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-gold-500/30 hover:bg-navy-800/10 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-navy-900 border border-navy-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-navy-600 group-hover:text-gold-500" />
              </div>
              <p className="text-sm font-bold text-navy-500 group-hover:text-navy-300">Nuovo Procedimento</p>
            </div>
          </div>
        ) : cases.length > 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-navy-700/30 rounded-3xl bg-navy-900/10">
            <div className="w-20 h-20 rounded-full bg-navy-900 border border-navy-800 flex items-center justify-center mb-6 shadow-2xl">
              <Search className="w-10 h-10 text-navy-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nessun Fascicolo Trovato</h3>
            <p className="text-navy-400 text-sm max-w-md">
              Prova a cambiare ricerca o filtro. Nessun fascicolo corrisponde ai criteri correnti.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-navy-700/30 rounded-3xl bg-navy-900/10">
            <div className="w-20 h-20 rounded-full bg-navy-900 border border-navy-800 flex items-center justify-center mb-6 shadow-2xl">
              <Folder className="w-10 h-10 text-navy-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nessun Fascicolo Presente</h3>
            <p className="text-navy-400 text-sm max-w-md mb-8">
              Crea il tuo primo fascicolo per memorizzare e organizzare trascrizioni, sintesi AI e procedure d'indagine.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 text-navy-950 hover:bg-gold-400 transition-all font-bold shadow-lg shadow-gold-500/20"
              aria-label="Crea il primo fascicolo"
            >
              <Plus className="w-5 h-5" />
              Crea Nuovo Fascicolo
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-navy-900 border border-navy-700 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-navy-400 hover:text-white"
              aria-label="Chiudi finestra nuovo fascicolo"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">Nuovo Fascicolo</h3>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label htmlFor="case-title" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                  Titolo
                </label>
                <input
                  id="case-title"
                  name="title"
                  autoComplete="off"
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500/50"
                  placeholder="Es. Omicidio Rossi"
                />
              </div>
              <div>
                <label htmlFor="case-procedure" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                  N. Procedimento
                </label>
                <input
                  id="case-procedure"
                  name="procedure"
                  autoComplete="off"
                  required
                  type="text"
                  value={formData.procedure}
                  onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500/50"
                  placeholder="Es. 1234/23 RGNR"
                />
              </div>
              <div>
                <label htmlFor="case-client" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                  Cliente
                </label>
                <input
                  id="case-client"
                  name="client"
                  autoComplete="name"
                  required
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500/50"
                  placeholder="Nome cognome..."
                />
              </div>
              <div>
                <label htmlFor="case-category" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                  Materia
                </label>
                <select
                  id="case-category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as CaseData['category'] })}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500/50"
                >
                  <option value="penale">Penale</option>
                  <option value="civile">Civile</option>
                  <option value="amministrativo">Amministrativo</option>
                  <option value="stragiudiziale">Stragiudiziale</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gold-500 text-navy-950 font-bold mt-4 hover:bg-gold-400 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registra in Database'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
