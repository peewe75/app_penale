export interface CaseData {
  id?: string;
  title: string;
  client: string;
  procedureNumber: string;
  category: 'penale' | 'civile' | 'amministrativo' | 'stragiudiziale';
  status: 'active' | 'archived' | 'pending';
  lastUpdate?: string;
  createdAt?: string;
  audioCount?: number;
  audioUrl?: string;
  audioPath?: string | null;
  audioMimeType?: string | null;
  audioSize?: number | null;
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new Error(text || `HTTP ${response.status}`);
  }
}

export const getCases = async (): Promise<CaseData[]> => {
  const response = await fetch('/api/cases', { method: 'GET' });
  if (!response.ok) {
    if (response.status !== 401) {
      console.error('Error fetching cases:', await response.text());
    }
    return [];
  }

  const payload = await parseJson<{ cases?: CaseData[] }>(response);
  return payload.cases ?? [];
};

export const getCaseById = async (id: string): Promise<CaseData | null> => {
  const cases = await getCases();
  return cases.find((caseItem) => caseItem.id === id) ?? null;
};

export const createCase = async (caseData: Omit<CaseData, 'id' | 'createdAt' | 'lastUpdate'>) => {
  const response = await fetch('/api/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseData),
  });

  if (!response.ok) {
    throw new Error((await response.text()) || 'Errore nella creazione del fascicolo.');
  }

  const payload = await parseJson<{ case?: CaseData }>(response);
  return payload.case?.id ?? '';
};

export const updateCaseData = async (id: string, updateData: Partial<CaseData>) => {
  const response = await fetch(`/api/cases/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error((await response.text()) || 'Errore aggiornamento fascicolo.');
  }

  return true;
};

export const deleteCase = async (id: string) => {
  const response = await fetch(`/api/cases/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error((await response.text()) || 'Errore eliminazione fascicolo.');
  }
  return true;
};
