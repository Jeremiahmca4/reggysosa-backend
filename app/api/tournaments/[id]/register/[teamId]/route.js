// API route for managing a single team registration for a tournament.
//
// DELETE /api/tournaments/:id/register/:teamId -> removes a team from a tournament.

import { createClient } from '@supabase/supabase-js';

// Shared CORS headers. Allow DELETE and OPTIONS for preflight.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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

// Respond to CORS preflight
export function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

// DELETE: remove the registration for the given team in a tournament
export async function DELETE(request, { params }) {
  const supabase = createSupabaseClient();
  if (!supabase) {
    return new Response(JSON.stringify({ ok: false, missing_env: true }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
  const tournamentId = params?.id;
  const teamId = params?.teamId;
  if (!tournamentId || !teamId) {
    return new Response(JSON.stringify({ ok: false, bad_request: true }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
  try {
    const { error } = await supabase
      .from('tournament_registrations')
      .delete()
      .match({ tournament_id: tournamentId, team_id: teamId });
    if (error) {
      return new Response(JSON.stringify({ ok: false, error: true }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: true }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}