import { storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addSegment, addEvent } from './transcripts';
import { updateCaseData } from './cases';

export const uploadAudioToFirebase = (
  file: File, 
  caseId: string, 
  onProgress: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `cases/${caseId}/${file.name}-${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      }, 
      (error) => {
        console.error("Upload error:", error);
        reject(error);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

/**
 * Chiama l'API Next.js proxy verso Deepgram per la diarization reale
 */
export const processAudioWithAI = async (caseId: string, audioUrl: string) => {
  // Salva l'URL dell'audio nel fascicolo (per permettere di riprodurlo dal player)
  await updateCaseData(caseId, {
    audioCount: 1, // o incremetare se ne facciamo multipli
    audioUrl: audioUrl
  });

  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: audioUrl })
    });

    if (!response.ok) {
      throw new Error(`Errore API: ${await response.text()}`);
    }

    const data = await response.json();
    
    if (data.segments && Array.isArray(data.segments)) {
      // Salva ogni segmento nel database
      for (const seg of data.segments) {
        await addSegment({
          caseId,
          time: seg.time,
          end: seg.end,
          speaker: seg.speaker,
          text: seg.text
        });
      }
    }

    // Genera un paio di eventi fittizi o estratti (da ultimare post-MVP)
    await addEvent({
      caseId,
      time: "00:00",
      type: "alert",
      title: "Trascrizione Avviata",
      desc: "L'analisi Deepgram è stata completata con successo."
    });

    return data.segments;
  } catch (err) {
    console.error("Errore elaborazione AI Reale:", err);
    // In caso di errore API (es. Deepgram Key mancante)
    throw err;
  }
};
