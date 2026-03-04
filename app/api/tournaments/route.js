// API routes for managing tournaments.
//
// GET  /api/tournaments        -> Returns a list of tournaments from Supabase.
// POST /api/tournaments        -> Creates a new tournament in Supabase.
//
// This route relies on the environment variables NEXT_PUBLIC_SUPABASE_URL
// and NEXT_PUBLIC_SUPABASE_ANON_KEY to connect to your Supabase project.

import { createClient } from '@supabase/supabase-js';

// CORS headers to allow the static frontend hosted on a different domain to
// communicate with this API. Without these headers, browsers will block
// cross‑origin requests.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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

// Handle CORS preflight requests. Next.js will invoke this for OPTIONS.
export function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

// GET: list tournaments
export async function GET() {
  const supabase = createSupabaseClient();
  if (!supabase) {
    return new Response(JSON.stringify({ ok: false, missing_env: true }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
  // Attempt to fetch tournaments from the public `tournaments` table. If the table
  // does not exist or an error occurs, return an empty array.
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*');
    if (error) {
      // Return empty list on error to avoid exposing internal details
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

// POST: create a new tournament
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
  const { name, maxTeams, startDate } = body || {};
  if (!name || !maxTeams) {
    return new Response(JSON.stringify({ ok: false, bad_request: true }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
  // Build the row to insert. Column names in your database may vary. Adjust
  // these fields to match your Supabase table definition.
  const insertData = {
    name,
    max_teams: maxTeams,
    start_date: startDate || null,
    status: 'open',
    created_at: new Date().toISOString(),
  };
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .insert(insertData)
      .select('*');
    if (error) {
      return new Response(JSON.stringify({ ok: false, error: true }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: true, tournament: data?.[0] }), {
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