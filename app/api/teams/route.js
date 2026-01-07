// API routes for managing teams.
//
// GET  /api/teams      -> Returns a list of teams from Supabase.
// POST /api/teams      -> Creates a new team in Supabase.
//
// Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// are required to connect to Supabase.

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

// GET: list teams
export async function GET() {
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
  try {
    const { data, error } = await supabase.from('teams').select('*');
    if (error) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(data ?? []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST: create a new team
export async function POST(request) {
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
  const { id, name, captain, members } = body || {};
  if (!name || !captain || !id) {
    return new Response(
      JSON.stringify({ ok: false, bad_request: true }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  const insertData = {
    id,
    name,
    captain,
    members: members || [],
    created_at: new Date().toISOString(),
  };
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert(insertData)
      .select('*');
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
      JSON.stringify({ ok: true, team: data?.[0] }),
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