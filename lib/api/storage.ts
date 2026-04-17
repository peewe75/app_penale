import { updateCaseData } from './cases';

function readJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export const uploadAudioToSupabase = (
  file: File,
  caseId: string,
  onProgress: (progress: number) => void,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/cases/${caseId}/audio/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress((event.loaded / event.total) * 100);
      }
    };

    xhr.onerror = () => reject(new Error('Upload audio non riuscito.'));
    xhr.onload = () => {
      const payload = readJsonSafely(xhr.responseText) as { audioUrl?: string; audioPath?: string; error?: string } | null;
      if (xhr.status >= 200 && xhr.status < 300 && payload?.audioUrl) {
        resolve(payload.audioUrl);
        return;
      }
      reject(new Error(payload?.error || xhr.responseText || 'Errore upload audio.'));
    };

    xhr.send(formData);
  });
};

/**
 * Esegue il processing AI del file appena caricato, poi salva segmenti ed eventi
 * tramite gli endpoint server centralizzati su Supabase/BCS.
 */
export const processAudioWithAI = async (caseId: string, audioUrl: string) => {
  await updateCaseData(caseId, { audioUrl });

  const response = await fetch(`/api/cases/${caseId}/audio/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ audioUrl }),
  });

  if (!response.ok) {
    throw new Error(`Errore processing audio: ${await response.text()}`);
  }

  const data = await response.json();
  return data.segments ?? [];
};
