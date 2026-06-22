import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'
import { GAMES } from '../lib/games-registry'

const ADMIN_EMAIL = 'orojansandor@gmail.com'

interface AdminUser {
  id: string
  email: string
  registered_at: string
  last_sign_in_at: string | null
  provider: string
  rounds_played: number
  best_score: number | null
  last_played: string | null
}

interface ActivityRow {
  user_email: string
  level: number
  score: number
  accuracy_points: number
  time_bonus: number
  quiz_points: number
  time_taken_seconds: number
  scenario_id: string
  played_at: string
}

function levelLabel(level: number): string {
  for (const g of GAMES) {
    for (const l of g.levels) {
      if (g.scoreOffset + l.id === level) return `${g.titleHu} – ${l.id}. szint`
    }
  }
  return `Szint ${level}`
}

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminPage() {
  const { session } = useAuth()
  const { lang, setLang } = useI18n()
  const navigate = useNavigate()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [activity, setActivity] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'users' | 'activity'>('users')
  const [filterEmail, setFilterEmail] = useState('')

  useEffect(() => {
    if (!session) return
    if (session.user.email !== ADMIN_EMAIL) { navigate('/dashboard'); return }

    Promise.all([
      supabase.rpc('get_admin_users'),
      supabase.rpc('get_admin_activity'),
    ]).then(([usersRes, actRes]) => {
      setUsers((usersRes.data as AdminUser[]) ?? [])
      setActivity((actRes.data as ActivityRow[]) ?? [])
      setLoading(false)
    })
  }, [session, navigate])

  if (!session || session.user.email !== ADMIN_EMAIL) return null

  const filteredActivity = filterEmail
    ? activity.filter(r => r.user_email.toLowerCase().includes(filterEmail.toLowerCase()))
    : activity

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-slate-700 transition-colors">
              ← Dashboard
            </button>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-slate-800 text-sm">🔐 Admin</span>
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1 text-xs">
            <button onClick={() => setLang('hu')} className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${lang === 'hu' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>HU</button>
            <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${lang === 'en' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>EN</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Regisztrált felhasználó', value: users.length },
            { label: 'Lejátszott kör (összesen)', value: activity.length },
            { label: 'Aktív játékos', value: users.filter(u => u.rounds_played > 0).length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
              <div className="text-3xl font-black text-indigo-600">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['users', 'activity'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
            >
              {t === 'users' ? `👥 Felhasználók (${users.length})` : `📋 Aktivitásnapló (${activity.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'users' ? (
          /* ── Users table ── */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Provider</th>
                  <th className="py-3 px-4 text-left">Regisztráció</th>
                  <th className="py-3 px-4 text-left">Utolsó belépés</th>
                  <th className="py-3 px-4 text-right">Körök</th>
                  <th className="py-3 px-4 text-right">Legjobb pont</th>
                  <th className="py-3 px-4 text-left">Utolsó játék</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => { setFilterEmail(u.email); setTab('activity') }}
                  >
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {u.email}
                      {u.email === ADMIN_EMAIL && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold">admin</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.provider === 'google' ? 'bg-red-50 text-red-600' : u.provider === 'github' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-600'}`}>
                        {u.provider}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{fmt(u.registered_at)}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{fmt(u.last_sign_in_at)}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">{u.rounds_played}</td>
                    <td className="py-3 px-4 text-right font-black text-indigo-600">{u.best_score ?? '—'}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{fmt(u.last_played)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="py-16 text-center text-slate-400 text-sm">Még nincs regisztrált felhasználó.</div>
            )}
            <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100">
              💡 Kattints egy sorra az aktivitásnaplóhoz szűrve
            </div>
          </div>
        ) : (
          /* ── Activity log ── */
          <div>
            {/* Filter */}
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                value={filterEmail}
                onChange={e => setFilterEmail(e.target.value)}
                placeholder="Szűrés email szerint…"
                className="flex-1 max-w-sm border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              {filterEmail && (
                <button onClick={() => setFilterEmail('')} className="text-xs text-slate-400 hover:text-slate-700 border border-slate-200 px-3 py-2 rounded-lg">
                  ✕ Törlés
                </button>
              )}
              <span className="text-xs text-slate-400">{filteredActivity.length} bejegyzés</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                    <th className="py-3 px-4 text-left">Időpont</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Játék / Szint</th>
                    <th className="py-3 px-4 text-left">Szcenárió</th>
                    <th className="py-3 px-4 text-right">Pont</th>
                    <th className="py-3 px-4 text-right hidden sm:table-cell">Pontosság</th>
                    <th className="py-3 px-4 text-right hidden sm:table-cell">Idő (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivity.map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 text-xs text-slate-400 whitespace-nowrap">{fmt(row.played_at)}</td>
                      <td className="py-2.5 px-4 text-slate-700 font-medium max-w-[140px] truncate">{row.user_email.split('@')[0]}</td>
                      <td className="py-2.5 px-4 text-slate-600 text-xs">{levelLabel(row.level)}</td>
                      <td className="py-2.5 px-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{row.scenario_id}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-base text-slate-900">{row.score}</td>
                      <td className="py-2.5 px-4 text-right text-xs text-slate-400 hidden sm:table-cell">{row.accuracy_points}</td>
                      <td className="py-2.5 px-4 text-right text-xs text-slate-400 hidden sm:table-cell">{row.time_taken_seconds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredActivity.length === 0 && (
                <div className="py-16 text-center text-slate-400 text-sm">Nincs aktivitás.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
