"use client";

// Helper to initialise the Supabase client in a server-safe way.
// This file exports a single `supabase` instance that can be imported
// anywhere in your application. The client uses the public anon key and
// URL from environment variables. It disables session persistence so it
// can safely run in server contexts (API routes, server components).

import { createClient } from '@supabase/supabase-js';

// Pull configuration from environment variables. These must be set at runtime.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be provided.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable persistence of the session on the server. We are not using auth yet.
    persistSession: false
  }
});
