import type { Handler } from '@netlify/functions'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const { messages, system, gameContext } = body

    // Szokr. tutor rendszer-prompt
    const systemPrompt = system || `
Te egy szokrátészi tutor vagy, aki mikroökonómiát tanít.
Soha ne számolj ki semmit — csak kérdezz, segíts gondolkodni, és magyarázz.
Kontextus: ${JSON.stringify(gameContext || {})}
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
        messages: messages || [],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return { statusCode: response.status, body: JSON.stringify({ error: err }) }
    }

    const data = await response.json()
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: data.content[0]?.text || '' }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}
