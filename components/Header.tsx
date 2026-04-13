'use client';

import React from 'react';
import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onToggleSidebar?: () => void;
}

export default function Header({ currentView, onToggleSidebar }: HeaderProps) {
  // Funzione semplice per formattare il nome della vista nel breadcrumb
  const formatViewName = (view: string) => {
    const names: Record<string, string> = {
      dashboard: 'Dashboard',
      upload: 'Carica Audio',
      player: 'Player & Trascrizione',
      chat: 'Chat Analitica',
      timeline: 'Timeline',
      cases: 'Fascicoli',
      setup: 'Setup & Pipeline'
    };
    return names[view] || view;
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 glass-strong border-b border-navy-700/20 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden text-navy-400 hover:text-gold-400 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-sm text-navy-400">
          <span className="text-navy-300 capitalize">{formatViewName(currentView)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs text-navy-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
          Supabase Connesso
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-navy-700/30 text-navy-400 hover:text-navy-300 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
