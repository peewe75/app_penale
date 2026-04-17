import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };
type TranscriptSegment = {
  time?: number;
  end?: number;
  speaker?: string;
  text?: string;
};

const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';

const formatTimestamp = (seconds?: number) => {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) return '00:00';
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
};

const buildTranscriptContext = (segments: TranscriptSegment[]) => {
  if (!segments?.length) return '';
  // Tronchiamo per sicurezza (contesto ragionevole, niente migliaia di token sprecati)
  const MAX_SEGMENTS = 400;
  const slice = segments.slice(0, MAX_SEGMENTS);
  const lines = slice.map((s) => `[${formatTimestamp(s.time)}] ${s.speaker || 'Speaker ?'}: ${s.text || ''}`);
  const truncatedNote = segments.length > MAX_SEGMENTS
    ? `\n\n[Nota: trascrizione troncata ai primi ${MAX_SEGMENTS} segmenti su ${segments.length}.]`
    : '';
  return lines.join('\n') + truncatedNote;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const segments: TranscriptSegment[] = Array.isArray(body.segments) ? body.segments : [];
    const caseTitle: string | undefined = body.caseTitle;

    if (!messages.length) {
      return NextResponse.json({ error: 'Nessun messaggio ricevuto.' }, { status: 400 });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY mancante nelle variabili di ambiente.' },
        { status: 500 }
      );
    }

    const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

    const transcriptContext = buildTranscriptContext(segments);
    const systemPrompt = [
      "Sei un assistente giuridico specializzato in diritto penale italiano, al servizio di un avvocato difensore.",
      "Il tuo compito è analizzare trascrizioni di intercettazioni audio (con identificazione degli speaker) e rispondere a domande operative sul fascicolo.",
      "Regole:",
      "- Rispondi sempre in italiano, in modo conciso e professionale.",
      "- Cita i minuti di riferimento nel formato [mm:ss] quando fai affermazioni basate sulla trascrizione.",
      "- Se una domanda non è rispondibile con il materiale fornito, dillo esplicitamente — non inventare.",
      "- Mantieni il tono neutro e forense, adatto a un avvocato.",
      caseTitle ? `\nFascicolo attivo: "${caseTitle}".` : '',
      transcriptContext
        ? `\n\n=== TRASCRIZIONE DEL FASCICOLO ===\n${transcriptContext}\n=== FINE TRASCRIZIONE ===`
        : "\n(Nessuna trascrizione disponibile per il fascicolo attivo. Rispondi su basi generali, avvisando l'utente di caricare un audio per analisi contestuali.)"
    ].filter(Boolean).join('\n');

    const payloadMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
    ];

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
        messages: payloadMessages,
        temperature: 0.2,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const reply: string | undefined = data?.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error('Risposta OpenRouter vuota o malformata.');
    }

    return NextResponse.json({ reply, model });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Errore sconosciuto nella chat AI.' },
      { status: 500 }
    );
  }
}
