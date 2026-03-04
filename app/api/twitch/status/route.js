import { NextResponse } from 'next/server';

/**
 * Simple status endpoint for the ReggySosa Twitch channel.
 *
 * This endpoint queries a public DecAPI service to determine whether the
 * channel is currently live. It returns a JSON object indicating the
 * status. If the channel is live, the response is `{ live: true }`,
 * otherwise `{ live: false }`. In the event of any error while
 * fetching, the endpoint returns `{ live: false }`.
 *
 * CORS is enabled so that the frontend can call this endpoint from any
 * origin. This avoids the need for manual CORS configuration on Vercel.
 */
export async function GET() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  try {
    // Use DecAPI to check stream uptime; the response contains 'offline'
    // when the channel is not live. DecAPI does not require authentication.
    const response = await fetch('https://decapi.me/twitch/uptime/reggysosa');
    const text = await response.text();
    const offline = /offline/i.test(text);
    return NextResponse.json({ live: !offline }, { headers });
  } catch (err) {
    // In case of any failure, treat the channel as offline.
    return NextResponse.json({ live: false }, { headers });
  }
}

export const runtime = 'edge';