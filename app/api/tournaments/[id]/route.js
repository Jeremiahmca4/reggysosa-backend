// Minimal backend patch route to update tournament bracket and status
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function PATCH(req, { params }) {
  const id = params.id;
  const data = await req.json();
  const updates = {};
  if (data.name) updates.name = data.name;
  if (data.maxTeams !== undefined) updates.max_teams = data.maxTeams;
  if (data.startDate) updates.start_date = data.startDate;
  if (data.status) updates.status = data.status;
  if (data.winner) updates.winner = data.winner;
  if (data.bracket) updates.bracket = data.bracket;

  const { error } = await supabase.from('tournaments').update(updates).eq('id', id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const id = params.id;
  // delete registrations first
  await supabase.from('tournament_registrations').delete().eq('tournament_id', id);
  const { error } = await supabase.from('tournaments').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
