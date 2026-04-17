'use client';

import React from 'react';
import { 
  LayoutGrid, 
  Upload, 
  PlayCircle, 
  MessageSquare, 
  Activity, 
  Folder, 
  Layers
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'upload', label: 'Carica Audio', icon: Upload },
  { id: 'player', label: 'Player & Trascrizione', icon: PlayCircle },
  { id: 'chat', label: 'Chat Analitica', icon: MessageSquare },
  { id: 'timeline', label: 'Timeline', icon: Activity },
  { id: 'cases', label: 'Fascicoli', icon: Folder },
  { id: 'setup', label: 'Setup & Pipeline', icon: Layers },
];

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col glass-strong border-r border-navy-700/30 z-50">
      {/* Logo */}
      <div className="p-5 border-b border-navy-700/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a1929" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text tracking-tight">LegalAI</h1>
            <p className="text-[10px] text-navy-400 uppercase tracking-widest font-medium">BCS Penale Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeView === item.id ? "active text-navy-200" : "text-navy-300"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-navy-700/30">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-xs font-bold text-gold-400 border border-navy-600">
            AP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy-200 truncate">Avv. P. Romano</p>
            <p className="text-[10px] text-navy-500">Studio Penale</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
