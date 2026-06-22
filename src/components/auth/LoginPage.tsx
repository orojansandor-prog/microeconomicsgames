import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { useI18n } from '../../lib/i18n'

export default function LoginPage() {
  const { session } = useAuth()
  const { t, lang, setLang } = useI18n()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (session) return <Navigate to="/dashboard" replace />

  const loginWithGoogle = async () => {
    setError('')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  const loginWithGitHub = async () => {
    setError('')
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  const loginWithEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (err) setError(err.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center p-6">
      {/* Lang toggle */}
      <div className="absolute top-4 right-4 flex gap-1 bg-white border border-slate-200 rounded-lg p-1 text-sm">
        <button onClick={() => setLang('hu')} className={`px-3 py-1 rounded-md font-medium transition-colors ${lang==='hu' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}>HU</button>
        <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-md font-medium transition-colors ${lang==='en' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}>EN</button>
      </div>

      <div className="w-full max-w-md">
        {/* Logo/brand */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📈</div>
          <h1 className="text-3xl font-bold text-slate-900">MicroeconomicsGames</h1>
          <p className="mt-2 text-slate-500 text-sm">
            {t('Tanuld meg a közgazdaságtant játszva', 'Learn economics by playing')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 text-center">
            {t('Bejelentkezés', 'Sign in')}
          </h2>

          {/* OAuth buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <button onClick={loginWithGoogle}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {t('Folytatás Google-lal', 'Continue with Google')}
            </button>
            <button onClick={loginWithGitHub}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              {t('Folytatás GitHub-bal', 'Continue with GitHub')}
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs text-slate-400 bg-white px-3">
              {t('vagy email-lel', 'or with email')}
            </div>
          </div>

          {sent ? (
            <div className="text-center p-4 bg-green-50 rounded-xl text-green-700 text-sm">
              {t(`✉️ Küldtünk egy linket a(z) ${email} címre!`, `✉️ We sent a link to ${email}!`)}
            </div>
          ) : (
            <form onSubmit={loginWithEmail} className="flex flex-col gap-3">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder={t('Email cím', 'Email address')}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                {loading ? t('Küldés...', 'Sending...') : t('Bejelentkezési link küldése', 'Send login link')}
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">
          {t('Ingyenes · Regisztráció nem szükséges', 'Free · No registration needed')}
        </p>
      </div>
    </div>
  )
}
