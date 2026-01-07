// Import the Supabase client from the shared lib. Use a relative import
// rather than a path alias since we haven't configured one.
import { supabase } from '../../../lib/supabaseClient.js';

// API route to check the health of the application and connectivity to Supabase.
// When deployed, sending a GET request to /api/health will return { ok: true }
// if the Supabase client can reach the backend. If connectivity fails, it
// responds with { ok: false, error } and a 500 status.

export async function GET() {
  try {
    // Perform a lightweight request using the Supabase client. We attempt
    // to select from a dummy table. Even though this table does not exist,
    // the call will still hit the Supabase API. Any response (data or error)
    // indicates that the client could connect to Supabase.
    await supabase.from('_dummy_health_check').select('id').limit(1);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    // If a network or authentication error occurred while contacting Supabase,
    // return a 500 status with details. Do not expose sensitive information.
    return new Response(
      JSON.stringify({ ok: false, error: 'Unable to reach Supabase' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}