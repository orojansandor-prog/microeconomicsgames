// Weekly read-only request so the free Supabase project is not paused for inactivity.
// Reads one non-personal column (game_scores.level, limit 1) with the public anon key; never writes.
import type { Config } from '@netlify/functions'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../generated/supabase-public.mjs'

export default async () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('supabase-keepalive: not configured')
    return new Response(null, { status: 500 })
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/game_scores?select=level&limit=1`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  })
  console.log(`supabase-keepalive: HTTP ${res.status}`)
  return new Response(null, { status: res.ok ? 204 : 502 })
}

// Mondays 05:17 UTC
export const config: Config = { schedule: '17 5 * * 1' }
