import type { Handler } from '@netlify/functions'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

// Security (Seraph audit 2, 2026-11-03): the live site does not call this endpoint (TutorChat is not
// mounted), so it is OFF unless TUTOR_PROXY_ENABLED=1 is set on the site. When enabled: fixed server-side
// system prompt (the client's "system" is ignored), own-origin only, size caps, per-IP limit per instance.
const ALLOWED_ORIGINS = new Set(['https://microeconomicsgames.com', 'https://www.microeconomicsgames.com'])
const MAX_MESSAGES = 12
const MAX_CHARS = 1500
const MAX_CONTEXT = 1500
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 20
const hits = new Map<string, number[]>()

function callerOrigin(headers: Record<string, string | undefined>): string {
  try { return new URL(headers.origin || headers.referer || '').origin } catch { return '' }
}

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) { hits.set(ip, recent); return true }
  recent.push(now)
  if (hits.size > 5000) hits.clear()
  hits.set(ip, recent)
  return false
}

export const handler: Handler = async (event) => {
  if (process.env.TUTOR_PROXY_ENABLED !== '1') {
    return { statusCode: 404, body: 'Not found' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }
  if (!ALLOWED_ORIGINS.has(callerOrigin(event.headers))) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) }
  }
  if (rateLimited(event.headers['x-nf-client-connection-ip'] || 'unknown')) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests' }) }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const { messages, gameContext } = body

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid messages' }) }
    }
    const clean = messages.map((m: { role?: unknown; content?: unknown }) => ({
      role: m?.role === 'assistant' ? 'assistant' : 'user',
      content: typeof m?.content === 'string' ? m.content.slice(0, MAX_CHARS) : '',
    }))
    if (clean.some((m) => !m.content)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid messages' }) }
    }
    const context = JSON.stringify(gameContext || {}).slice(0, MAX_CONTEXT)

    // Szokr. tutor rendszer-prompt (szerveroldalon rögzített)
    const systemPrompt = `
Te egy szokrátészi tutor vagy, aki mikroökonómiát tanít.
Soha ne számolj ki semmit — csak kérdezz, segíts gondolkodni, és magyarázz.
Csak mikroökonómiai és a játékhoz kapcsolódó kérdésekre válaszolj; minden más kérést udvariasan utasíts el.
Kontextus: ${context}
Legyél tömör (max 3-4 mondat). Mindig a tanuló szintjéhez igazodj.
Ha a tanuló magyarul kérdez, magyarul válaszolj. Ha angolul, angolul.
    `.trim()

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: systemPrompt,
        messages: clean,
      }),
    })

    if (!response.ok) {
      console.error('Anthropic API error', response.status, (await response.text()).slice(0, 400))
      return { statusCode: 502, body: JSON.stringify({ error: 'Upstream error' }) }
    }

    const data = await response.json()
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: data.content[0]?.text || '' }),
    }
  } catch (err) {
    console.error('claude-proxy error', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) }
  }
}
