import { useState } from 'react'
import { useI18n } from '../../lib/i18n'

interface Message { role: 'user' | 'assistant'; content: string }

interface Props {
  gameContext?: Record<string, unknown>
  initialPrompt?: string
}

export default function TutorChat({ gameContext, initialPrompt }: Props) {
  const { t, lang } = useI18n()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/.netlify/functions/claude-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          gameContext: { ...gameContext, lang },
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content || t('Hiba történt.', 'An error occurred.') }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t('Kapcsolódási hiba.', 'Connection error.') }])
    }
    setLoading(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Float button */}
      {!open && (
        <button onClick={() => { setOpen(true); if (messages.length === 0 && initialPrompt) send(initialPrompt) }}
          className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-110">
          🤖
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col" style={{ maxHeight: '70vh' }}>
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <div className="text-sm font-semibold text-slate-800">{t('Szokrátészi Tutor', 'Socratic Tutor')}</div>
                <div className="text-xs text-slate-400">{t('Kérdezz bármit!', 'Ask anything!')}</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
            {messages.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-4">
                {t('Tedd fel a kérdésedet a tutornak!', 'Ask the tutor your question!')}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gyors kérdések */}
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {[
              t('Miért MR = MC?', 'Why MR = MC?'),
              t('Mi a DWL?', 'What is DWL?'),
              t('Magyarázd el egyszerűen', 'Explain simply'),
            ].map(q => (
              <button key={q} onClick={() => send(q)}
                className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors">
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={e => { e.preventDefault(); send(input) }}
            className="flex gap-2 p-4 border-t border-slate-200">
            <input
              value={input} onChange={e => setInput(e.target.value)}
              placeholder={t('Írj kérdést...', 'Type a question...')}
              className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-sm disabled:opacity-40 transition-colors">
              →
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
