// Import the Supabase client from the shared lib. Use a relative import
// rather than a path alias since we haven't configured one.
import { createClient } from '@supabase/supabase-js';

// API route to check the health of the application and connectivity to Supabase.
// When deployed, sending a GET request to /api/health will return { ok: true }
// if the Supabase client can reach the backend. If connectivity fails, it
// responds with { ok: false, error } and a 500 status.

export async function GET() {
  // Read Supabase credentials from the environment. These variables should be
  // defined in your deployment (e.g. on Vercel). Using NEXT_PUBLIC_ prefix
  // allows them to be exposed on both client and server.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If either credential is missing, return a diagnostic message. We provide
  // a non‑sensitive field so users can identify misconfigured deployments.
  if (!url || !anonKey) {
    return new Response(JSON.stringify({ ok: false, missing_env: true }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Validate that the URL is a well‑formed URL. If invalid, return a
  // diagnostic field indicating a bad configuration rather than throwing.
  try {
    new URL(url);
  } catch {
    return new Response(JSON.stringify({ ok: false, bad_url: true }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Use the Supabase Auth health endpoint to verify connectivity. We avoid
  // depending on a specific table existing and instead rely on Supabase’s
  // built‑in health check. This endpoint responds with a 200 status when
  // the project is reachable and the provided anon key is valid.
  const healthEndpoint = `${url.replace(/\/$/, '')}/auth/v1/health`;
  try {
    const res = await fetch(healthEndpoint, {
      headers: { apikey: anonKey }
    });
    if (res.ok) {
      // Supabase responded successfully, so connectivity is confirmed.
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    // Non‑200 response indicates something is wrong (e.g. bad key). Do not
    // expose sensitive details; simply mark the connection as failed.
    return new Response(JSON.stringify({ ok: false, unreachable: true }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    // Network error (DNS, fetch) – Supabase cannot be reached.
    return new Response(JSON.stringify({ ok: false, unreachable: true }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// Handle CORS preflight requests
export function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}