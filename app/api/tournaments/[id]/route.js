// API route for retrieving or updating a single tournament.
//
// PATCH /api/tournaments/:id -> Updates tournament fields (name, maxTeams, startDate).
// Only specified fields will be updated. Uses Supabase and returns ok:true on success.

import { createClient } from '@supabase/supabase-js';

// Reuse CORS headers consistent with other API routes. Allow PATCH, GET and OPTIONS.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  // Allow DELETE in addition to GET, PATCH and OPTIONS for removing tournaments.
  'Access-Control-Allow-Methods': 'GET,PATCH,DELETE,OPTIONS',
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

// Respond to CORS preflight requests.
export function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

// DELETE: remove a tournament and its registrations by id. Returns ok:true on success.
export async function DELETE(request, { params }) {
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
  try {
    // First delete registrations for this tournament
    const { error: regErr } = await supabase
      .from('tournament_registrations')
      .delete()
      .eq('tournament_id', id);
    if (regErr) {
      return new Response(JSON.stringify({ ok: false, error: true }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    // Then delete the tournament itself
    const { error: delErr } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);
    if (delErr) {
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

// GET: return a single tournament by id. If not found, return 404.
export async function GET(request, { params }) {
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
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      return new Response(JSON.stringify({ ok: false, not_found: true }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(data), {
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

// PATCH: update tournament fields by id. Accepts a JSON body with optional
// properties: name (string), maxTeams (number), startDate (string or null).
export async function PATCH(request, { params }) {
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
  const updates = {};
  if (typeof body.name === 'string' && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (typeof body.maxTeams === 'number' && !Number.isNaN(body.maxTeams)) {
    updates.max_teams = body.maxTeams;
  }
  if ('startDate' in body) {
    updates.start_date = body.startDate || null;
  }
  if (Object.keys(updates).length === 0) {
    return new Response(JSON.stringify({ ok: false, bad_request: true }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
  try {
    const { error } = await supabase
      .from('tournaments')
      .update(updates)
      .eq('id', id);
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