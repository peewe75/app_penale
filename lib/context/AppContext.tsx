'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCases, CaseData } from '../api/cases';

interface AppContextType {
  cases: CaseData[];
  activeCaseId: string | null;
  setActiveCaseId: (id: string | null) => void;
  activeCase: CaseData | null;
  refreshCases: () => Promise<void>;
  isLoadingCases: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isLoadingCases, setIsLoadingCases] = useState(true);

  const refreshCases = async () => {
    setIsLoadingCases(true);
    try {
      const allCases = await getCases();
      setCases(allCases);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCases(false);
    }
  };

  useEffect(() => {
    refreshCases();
  }, []);

  const activeCase = cases.find(c => c.id === activeCaseId) || null;

  return (
    <AppContext.Provider value={{ cases, activeCaseId, setActiveCaseId, activeCase, refreshCases, isLoadingCases }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
