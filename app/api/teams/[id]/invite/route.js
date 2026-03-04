// API route for inviting a user to a team.
//
// POST /api/teams/:id/invite -> append an email to the invites array for the team.
//
// Expects JSON body { email }. Returns ok:true with the updated team on success.

import { createClient } from '@supabase/supabase-js';

// CORS headers to allow cross‑origin POST requests from the frontend.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Helper to construct a Supabase client using environment variables. Returns
// null if credentials are missing or the URL is invalid.
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

// Handle CORS preflight requests. Respond with 200 OK and appropriate headers.
export function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

export async function POST(request, { params }) {
  const supabase = createSupabaseClient();
  if (!supabase) {
    return new Response(JSON.stringify({ ok: false, missing_env: true }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
  const id = params?.id;
  if (!id) {
    return new Response(JSON.stringify({ ok: false, bad_request: true }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, bad_request: true }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
  const email = (body?.email || '').trim().toLowerCase();
  if (!email) {
    return new Response(JSON.stringify({ ok: false, bad_request: true }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
  try {
    // Fetch existing invites for this team
    const { data: teamRow, error: fetchErr } = await supabase
      .from('teams')
      .select('invites')
      .eq('id', id)
      .single();
    if (fetchErr) {
      return new Response(JSON.stringify({ ok: false, error: true }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    let invites = Array.isArray(teamRow?.invites) ? teamRow.invites : [];
    if (!invites.includes(email)) {
      invites.push(email);
    }
    // Update the invites array on the team row
    const { data: updated, error: updateErr } = await supabase
      .from('teams')
      .update({ invites })
      .eq('id', id)
      .select('*');
    if (updateErr) {
      return new Response(JSON.stringify({ ok: false, error: true }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    return new Response(
      JSON.stringify({ ok: true, team: updated?.[0] }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: true }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}