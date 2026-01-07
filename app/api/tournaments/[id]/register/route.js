// API route for registering a team to a tournament.
//
// POST /api/tournaments/:id/register -> registers a teamId to a tournament.
//
// Expects JSON body { teamId }. Returns ok:true on success.

import { createClient } from '@supabase/supabase-js';

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    new URL(url);
  } catch {
    return null;
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request, { params }) {
  const supabase = createSupabaseClient();
  if (!supabase) {
    return new Response(
      JSON.stringify({ ok: false, missing_env: true }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  const id = params?.id;
  if (!id) {
    return new Response(
      JSON.stringify({ ok: false, bad_request: true }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, bad_request: true }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  const { teamId } = body || {};
  if (!teamId) {
    return new Response(
      JSON.stringify({ ok: false, bad_request: true }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  // Insert a row into a join table (tournament_registrations). This table
  // should have columns tournament_id and team_id. You must create it in
  // Supabase ahead of time. If the table does not exist, an error will be
  // returned.
  try {
    const { error } = await supabase
      .from('tournament_registrations')
      .insert({ tournament_id: id, team_id: teamId });
    if (error) {
      return new Response(
        JSON.stringify({ ok: false, error: true }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    return new Response(
      JSON.stringify({ ok: true }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: true }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}