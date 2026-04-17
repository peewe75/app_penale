export interface SegmentData {
  id?: string;
  caseId: string;
  time: number;
  end: number;
  speaker: string;
  text: string;
  importance?: 'critical' | 'normal';
}

export interface TimelineEventData {
  id?: string;
  caseId: string;
  time: string;
  type: 'info' | 'speaker' | 'alert' | 'legal';
  title: string;
  desc: string;
  iconName?: string;
  createdAt?: string;
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new Error(text || `HTTP ${response.status}`);
  }
}

export const getSegmentsByCaseId = async (caseId: string): Promise<SegmentData[]> => {
  const response = await fetch(`/api/cases/${caseId}/segments`, { method: 'GET' });
  if (!response.ok) {
    console.error('Error fetching segments:', await response.text());
    return [];
  }

  const payload = await parseJson<{ segments?: SegmentData[] }>(response);
  return payload.segments ?? [];
};

export const addSegment = async (segmentData: Omit<SegmentData, 'id'>) => {
  const response = await fetch(`/api/cases/${segmentData.caseId}/segments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(segmentData),
  });

  if (!response.ok) {
    throw new Error((await response.text()) || 'Errore aggiunta segmento.');
  }

  const payload = await parseJson<{ segment?: SegmentData }>(response);
  return payload.segment?.id ?? '';
};

export const getEventsByCaseId = async (caseId: string): Promise<TimelineEventData[]> => {
  const response = await fetch(`/api/cases/${caseId}/events`, { method: 'GET' });
  if (!response.ok) {
    console.error('Error fetching events:', await response.text());
    return [];
  }

  const payload = await parseJson<{ events?: TimelineEventData[] }>(response);
  return payload.events ?? [];
};

export const addEvent = async (eventData: Omit<TimelineEventData, 'id' | 'createdAt'>) => {
  const response = await fetch(`/api/cases/${eventData.caseId}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error((await response.text()) || 'Errore aggiunta evento.');
  }

  const payload = await parseJson<{ event?: TimelineEventData }>(response);
  return payload.event?.id ?? '';
};
