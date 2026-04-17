import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const AUDIO_BUCKET = 'legal-ai-penale-audio';

function sanitizeAudioUrl(filePath?: string | null) {
  return filePath ? filePath : null;
}

async function withSignedAudioUrl<T extends { audio_path?: string | null; audio_url?: string | null }>(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  row: T,
) {
  if (!row.audio_path) {
    return { ...row, audioUrl: row.audio_url ?? null };
  }

  const { data } = await supabase.storage.from(AUDIO_BUCKET).createSignedUrl(row.audio_path, 60 * 60 * 24);
  return {
    ...row,
    audioUrl: data?.signedUrl ?? row.audio_url ?? null,
  };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Login richiesto.' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase non configurato.' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('legal_ai_penale_cases')
    .select('*')
    .eq('owner_id', userId)
    .order('last_update', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const cases = await Promise.all((data ?? []).map((row) => withSignedAudioUrl(supabase, row)));
  return NextResponse.json({ cases });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Login richiesto.' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase non configurato.' }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const client = typeof body?.client === 'string' ? body.client.trim() : '';
  const procedureNumber = typeof body?.procedureNumber === 'string' ? body.procedureNumber.trim() : '';
  const category = typeof body?.category === 'string' ? body.category.trim() : 'penale';

  if (!title || !client || !procedureNumber) {
    return NextResponse.json({ error: 'Titolo, cliente e procedimento sono obbligatori.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('legal_ai_penale_cases')
    .insert({
      owner_id: userId,
      title,
      client,
      procedure_number: procedureNumber,
      category,
      status: 'active',
      audio_count: 0,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const caseRow = await withSignedAudioUrl(supabase, data);
  return NextResponse.json({ case: caseRow }, { status: 201 });
}
