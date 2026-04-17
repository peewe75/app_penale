import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const AUDIO_BUCKET = 'legal-ai-penale-audio';

async function ensureOwner(caseId: string, userId: string, supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>) {
  const { data, error } = await supabase
    .from('legal_ai_penale_cases')
    .select('*')
    .eq('id', caseId)
    .eq('owner_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

async function enrichCase(supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>, row: any) {
  if (!row?.audio_path) {
    return { ...row, audioUrl: row?.audio_url ?? null };
  }

  const { data } = await supabase.storage.from(AUDIO_BUCKET).createSignedUrl(row.audio_path, 60 * 60 * 24);
  return { ...row, audioUrl: data?.signedUrl ?? row.audio_url ?? null };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Login richiesto.' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase non configurato.' }, { status: 503 });
  }

  const { caseId } = await params;
  const existing = await ensureOwner(caseId, userId, supabase);
  if (!existing) {
    return NextResponse.json({ error: 'Fascicolo non trovato.' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = { last_update: new Date().toISOString() };

  if (typeof body.title === 'string') update.title = body.title.trim();
  if (typeof body.client === 'string') update.client = body.client.trim();
  if (typeof body.procedureNumber === 'string') update.procedure_number = body.procedureNumber.trim();
  if (typeof body.category === 'string') update.category = body.category.trim();
  if (typeof body.status === 'string') update.status = body.status.trim();
  if (typeof body.audioCount === 'number') update.audio_count = body.audioCount;
  if (typeof body.audioUrl === 'string') update.audio_url = body.audioUrl;
  if (typeof body.audioPath === 'string') update.audio_path = body.audioPath;
  if (typeof body.audioMimeType === 'string') update.audio_mime_type = body.audioMimeType;
  if (typeof body.audioSize === 'number') update.audio_size = body.audioSize;

  const { data, error } = await supabase
    .from('legal_ai_penale_cases')
    .update(update)
    .eq('id', caseId)
    .eq('owner_id', userId)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ case: await enrichCase(supabase, data) });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Login richiesto.' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase non configurato.' }, { status: 503 });
  }

  const { caseId } = await params;
  const existing = await ensureOwner(caseId, userId, supabase);
  if (!existing) {
    return NextResponse.json({ error: 'Fascicolo non trovato.' }, { status: 404 });
  }

  await supabase.from('legal_ai_penale_segments').delete().eq('case_id', caseId);
  await supabase.from('legal_ai_penale_events').delete().eq('case_id', caseId);
  await supabase.from('legal_ai_penale_cases').delete().eq('id', caseId).eq('owner_id', userId);

  if (existing.audio_path) {
    await supabase.storage.from(AUDIO_BUCKET).remove([existing.audio_path]);
  }

  return NextResponse.json({ success: true });
}
