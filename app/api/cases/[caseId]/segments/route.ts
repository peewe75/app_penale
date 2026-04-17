import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET(_: Request, { params }: { params: Promise<{ caseId: string }> }) {
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
    .select('id')
    .eq('id', caseId)
    .eq('owner_id', userId)
    .maybeSingle();

  if (!ownerRow) {
    return NextResponse.json({ error: 'Fascicolo non trovato.' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('legal_ai_penale_segments')
    .select('*')
    .eq('case_id', caseId)
    .order('time', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ segments: data ?? [] });
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
    .select('id')
    .eq('id', caseId)
    .eq('owner_id', userId)
    .maybeSingle();

  if (!ownerRow) {
    return NextResponse.json({ error: 'Fascicolo non trovato.' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const { time, end, speaker, text, importance } = body ?? {};

  if (typeof time !== 'number' || typeof end !== 'number' || typeof speaker !== 'string' || typeof text !== 'string') {
    return NextResponse.json({ error: 'Segmento non valido.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('legal_ai_penale_segments')
    .insert({
      case_id: caseId,
      owner_id: userId,
      time,
      end,
      speaker,
      text,
      importance: importance === 'critical' ? 'critical' : 'normal',
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from('legal_ai_penale_cases')
    .update({ last_update: new Date().toISOString() })
    .eq('id', caseId)
    .eq('owner_id', userId);

  return NextResponse.json({ segment: data }, { status: 201 });
}
