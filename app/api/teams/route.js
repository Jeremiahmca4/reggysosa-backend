// API routes for managing teams.
//
// GET  /api/teams      -> Returns a list of teams from Supabase.
// POST /api/teams      -> Creates a new team in Supabase.
//
// Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// are required to connect to Supabase.

import { createClient } from '@supabase/supabase-js';

// CORS headers to allow cross‑origin requests from the static frontend. Without these
// headers, browsers will block requests to this API when called from a
// different domain.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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

// Handle CORS preflight requests. Next.js will call this handler
// automatically for OPTIONS requests.
export function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

// GET: list teams
export async function GET() {
  const supabase = createSupabaseClient();
  if (!supabase) {
    return new Response(JSON.stringify({ ok: false, missing_env: true }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
  try {
    const { data, error } = await supabase.from('teams').select('*');
    if (error) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(data ?? []), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}

// POST: create a new team
export async function POST(request) {
  const supabase = createSupabaseClient();
  if (!supabase) {
    return new Response(JSON.stringify({ ok: false, missing_env: true }), {
      status: 500,
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
  const { id, name, captain, members } = body || {};
  if (!name || !captain || !id) {
    return new Response(JSON.stringify({ ok: false, bad_request: true }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
  const insertData = {
    id,
    name,
    captain,
    members: members || [],
    invites: body.invites ?? [],
    created_at: new Date().toISOString(),
  };
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert(insertData)
      .select('*');
    if (error) {
      return new Response(JSON.stringify({ ok: false, error: true }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: true, team: data?.[0] }), {
      status: 201,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: true }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}