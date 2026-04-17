import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

type TranscriptSegment = {
  time?: number;
  end?: number;
  speaker?: string;
  text?: string;
};

type ExtractedEvent = {
  time: string;
  type: 'info' | 'speaker' | 'alert' | 'legal';
  title: string;
  desc: string;
};

const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';
const MAX_EVENTS = 12;

const formatTimestamp = (seconds?: number) => {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) return '00:00';
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
};

const buildTranscript = (segments: TranscriptSegment[]) => {
  const MAX_SEGMENTS = 600;
  const slice = segments.slice(0, MAX_SEGMENTS);
  return slice
    .map((s) => `[${formatTimestamp(s.time)}] ${s.speaker || 'Speaker ?'}: ${s.text || ''}`)
    .join('\n');
};

// Estrae il primo array JSON valido da una stringa (robusto a preamboli/markdown)
const extractJsonArray = (raw: string): any[] | null => {
  if (!raw) return null;
  // Prova parse diretto
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // continua con lo scan
  }
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const sanitizeEvent = (raw: any): ExtractedEvent | null => {
  if (!raw || typeof raw !== 'object') return null;
  const time = typeof raw.time === 'string' ? raw.time : formatTimestamp(Number(raw.time));
  const allowedTypes: ExtractedEvent['type'][] = ['info', 'speaker', 'alert', 'legal'];
  const type: ExtractedEvent['type'] = allowedTypes.includes(raw.type) ? raw.type : 'info';
  const title = typeof raw.title === 'string' ? raw.title.slice(0, 120) : '';
  const desc = typeof raw.desc === 'string' ? raw.desc.slice(0, 500) : '';
  if (!title) return null;
  return { time, type, title, desc };
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const segments: TranscriptSegment[] = Array.isArray(body.segments) ? body.segments : [];

    if (!segments.length) {
      return NextResponse.json({ events: [] });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY mancante nelle variabili di ambiente.' },
        { status: 500 }
      );
    }

    const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
    const transcript = buildTranscript(segments);

    const systemPrompt = [
      'Sei un analista forense esperto in diritto penale italiano.',
      'Il tuo compito è identificare gli eventi più rilevanti in una trascrizione di intercettazione audio.',
      `Restituisci SOLO un array JSON con al massimo ${MAX_EVENTS} eventi (meno se non ci sono eventi significativi).`,
      'Schema di ogni evento:',
      '{"time": "mm:ss", "type": "alert"|"legal"|"speaker"|"info", "title": "breve titolo", "desc": "sintesi neutra"}',
      'Regole:',
      '- "alert" = minacce, ammissioni, riferimenti a reati, armi, denaro illecito.',
      '- "legal" = riferimenti a procedimenti, avvocati, giudici, atti processuali.',
      '- "speaker" = ingresso di nuovi speaker, cambi di interlocutore rilevanti.',
      '- "info" = eventi generici di contesto (luoghi, date, numeri, importi).',
      '- "time" deve essere coerente col minutaggio dei segmenti forniti.',
      '- NON includere testo fuori dal JSON. Nessun markdown, nessuna spiegazione.',
      '- Se non ci sono eventi significativi, restituisci [].'
    ].join('\n');

    const userPrompt = `TRASCRIZIONE:\n${transcript}\n\nRestituisci SOLO il JSON array richiesto.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.appUrl,
        'X-Title': 'LegalAI Penale'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const raw: string = data?.choices?.[0]?.message?.content || '';
    const parsed = extractJsonArray(raw);

    if (!parsed) {
      // Fallback silenzioso: meglio zero eventi che crash
      console.warn('extract-events: JSON non parsabile. Raw:', raw.slice(0, 500));
      return NextResponse.json({ events: [] });
    }

    const events = parsed
      .map(sanitizeEvent)
      .filter((e): e is ExtractedEvent => e !== null)
      .slice(0, MAX_EVENTS);

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Extract-events API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Errore sconosciuto nell\'estrazione eventi.' },
      { status: 500 }
    );
  }
}
