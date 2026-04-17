import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const AUDIO_BUCKET = 'legal-ai-penale-audio';

function slugifyFilename(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function POST(req: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Login richiesto.' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase non configurato.' }, { status: 503 });
  }

  const { caseId } = await params;
  const { data: ownerRow } = await supabase
    .from('legal_ai_penale_cases')
    .select('id, audio_count')
    .eq('id', caseId)
    .eq('owner_id', userId)
    .maybeSingle();

  if (!ownerRow) {
    return NextResponse.json({ error: 'Fascicolo non trovato.' }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File audio mancante.' }, { status: 400 });
  }

  const safeName = slugifyFilename(file.name || 'audio');
  const storagePath = `${userId}/${caseId}/${Date.now()}-${safeName}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from(AUDIO_BUCKET).upload(storagePath, bytes, {
    contentType: file.type || 'audio/mpeg',
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: signed } = await supabase.storage.from(AUDIO_BUCKET).createSignedUrl(storagePath, 60 * 60 * 24);
  const audioUrl = signed?.signedUrl ?? '';

  const { data: updated, error: updateError } = await supabase
    .from('legal_ai_penale_cases')
    .update({
      audio_count: (ownerRow.audio_count ?? 0) + 1,
      audio_path: storagePath,
      audio_url: audioUrl,
      audio_mime_type: file.type || null,
      audio_size: file.size,
      last_update: new Date().toISOString(),
    })
    .eq('id', caseId)
    .eq('owner_id', userId)
    .select('*')
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    audioUrl,
    audioPath: storagePath,
    case: updated,
  });
}
