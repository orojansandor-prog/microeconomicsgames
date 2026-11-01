// Writes netlify/generated/supabase-public.mjs from the build env, so the scheduled
// supabase-keepalive function can use the public anon key (the same one shipped in the
// browser bundle). The key is never committed; the env var stays scoped to builds.
import { mkdirSync, writeFileSync } from 'node:fs'

const url = process.env.VITE_SUPABASE_URL || ''
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
mkdirSync('netlify/generated', { recursive: true })
writeFileSync(
  'netlify/generated/supabase-public.mjs',
  `export const SUPABASE_URL = ${JSON.stringify(url)}\nexport const SUPABASE_ANON_KEY = ${JSON.stringify(anonKey)}\n`,
)
console.log(`gen-supabase-public: url ${url ? 'set' : 'MISSING'}, anon key ${anonKey ? 'set' : 'MISSING'}`)
