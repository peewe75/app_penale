import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Manca l\'URL dell\'audio' }, { status: 400 });
    }

    const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

    if (!DEEPGRAM_API_KEY) {
      return NextResponse.json({ error: 'API Key Deepgram mancante nelle variabili di ambiente' }, { status: 500 });
    }

    // Chiamata all'API di Deepgram per la diarization (chi parla)
    const response = await fetch('https://api.deepgram.com/v1/listen?diarize=true&language=it&smart_format=true&punctuate=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: url })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Errore Deepgram: ${err}`);
    }

    const data = await response.json();
    
    // Mappiamo i risultati Deepgram per l'interfaccia dell'app (segments e timeline)
    const utterances = data.results?.utterances || [];

    const segments = utterances.map((u: any, idx: number) => ({
      id: idx + 1,
      time: u.start,
      end: u.end,
      speaker: `Speaker ${u.speaker !== undefined ? u.speaker : 'Sconosciuto'}`,
      text: u.transcript,
      importance: (u.transcript.toLowerCase().includes('illecito') || u.transcript.toLowerCase().includes('accordo')) ? 'critical' : 'normal'
    }));

    return NextResponse.json({ segments });
    
  } catch (error: any) {
    console.error("Deepgram API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
