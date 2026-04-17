import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { env, hasDeepgramConfig, hasOpenRouterConfig } from '@/lib/env';

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

const AUDIO_BUCKET = 'legal-ai-penale-audio';
const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';

const formatTimestamp = (seconds?: number) => {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) return '00:00';
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
};

const extractJsonArray = (raw: string): any[] | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // continue
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
  const allowedTypes: ExtractedEvent['type'][] = ['info', 'speaker', 'alert', 'legal'];
  const time = typeof raw.time === 'string' ? raw.time : formatTimestamp(Number(raw.time));
  const type: ExtractedEvent['type'] = allowedTypes.includes(raw.type) ? raw.type : 'info';
  const title = typeof raw.title === 'string' ? raw.title.slice(0, 120) : '';
  const desc = typeof raw.desc === 'string' ? raw.desc.slice(0, 500) : '';
  if (!title) return null;
  return { time, type, title, desc };
};

export async function POST(req: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Login richiesto.' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase non configurato.' }, { status: 503 });
  }

  if (!hasDeepgramConfig() || !hasOpenRouterConfig()) {
    return NextResponse.json({ error: 'Deepgram o OpenRouter non configurati.' }, { status: 503 });
  }

  const { caseId } = await params;
  const { data: caseRow } = await supabase
    .from('legal_ai_penale_cases')
    .select('id, audio_url, audio_path')
    .eq('id', caseId)
    .eq('owner_id', userId)
    .maybeSingle();

  if (!caseRow) {
    return NextResponse.json({ error: 'Fascicolo non trovato.' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const audioUrl = typeof body?.audioUrl === 'string' ? body.audioUrl.trim() : '';
  const resolvedAudioUrl = audioUrl || caseRow.audio_url;

  if (!resolvedAudioUrl) {
    return NextResponse.json({ error: 'URL audio mancante.' }, { status: 400 });
  }

  const deepgramResponse = await fetch(
    'https://api.deepgram.com/v1/listen?diarize=true&language=it&smart_format=true&punctuate=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${env.deepgramApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: resolvedAudioUrl }),
    },
  );

  if (!deepgramResponse.ok) {
    const errText = await deepgramResponse.text();
    return NextResponse.json({ error: `Errore Deepgram: ${errText}` }, { status: 500 });
  }

  const deepgramData = await deepgramResponse.json();
  const utterances = deepgramData.results?.utterances || [];

  const segments = utterances.map((u: any) => ({
    time: u.start,
    end: u.end,
    speaker: `Speaker ${u.speaker !== undefined ? u.speaker : 'Sconosciuto'}`,
    text: u.transcript,
    importance:
      u.transcript?.toLowerCase?.().includes('illecito') || u.transcript?.toLowerCase?.().includes('accordo')
        ? 'critical'
        : 'normal',
  }));

  await supabase.from('legal_ai_penale_segments').delete().eq('case_id', caseId);
  await supabase.from('legal_ai_penale_events').delete().eq('case_id', caseId);

  if (segments.length > 0) {
    const segmentRows = segments.map((segment: TranscriptSegment & { importance?: string }) => ({
      case_id: caseId,
      owner_id: userId,
      time: segment.time ?? 0,
      end: segment.end ?? 0,
      speaker: segment.speaker ?? 'Speaker ?',
      text: segment.text ?? '',
      importance: segment.importance === 'critical' ? 'critical' : 'normal',
    }));

    const { error: segmentError } = await supabase.from('legal_ai_penale_segments').insert(segmentRows);
    if (segmentError) {
      return NextResponse.json({ error: segmentError.message }, { status: 500 });
    }
  }

  try {
    const transcript = segments
      .slice(0, 600)
      .map((s: TranscriptSegment) => `[${formatTimestamp(s.time)}] ${s.speaker || 'Speaker ?'}: ${s.text || ''}`)
      .join('\n');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.appUrl,
        'X-Title': 'LegalAI Penale',
      },
      body: JSON.stringify({
        model: env.openRouterModel || DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'Sei un analista forense esperto in diritto penale italiano. Restituisci solo un array JSON di eventi significativi con schema {time,type,title,desc}.',
          },
          {
            role: 'user',
            content: `TRASCRIZIONE:\n${transcript}\n\nRestituisci SOLO il JSON array richiesto.`,
          },
        ],
        temperature: 0.1,
        max_tokens: 1500,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const parsed = extractJsonArray(data?.choices?.[0]?.message?.content || '');
      if (parsed) {
        const events = parsed.map(sanitizeEvent).filter((item): item is ExtractedEvent => Boolean(item));
        if (events.length > 0) {
          const eventRows = events.map((event) => ({
            case_id: caseId,
            owner_id: userId,
            time: event.time,
            type: event.type,
            title: event.title,
            desc: event.desc,
          }));
          await supabase.from('legal_ai_penale_events').insert(eventRows);
        }
      }
    }
  } catch (error) {
    console.error('Event extraction fallback:', error);
  }

  await supabase
    .from('legal_ai_penale_cases')
    .update({ last_update: new Date().toISOString() })
    .eq('id', caseId)
    .eq('owner_id', userId);

  return NextResponse.json({ segments });
}
