import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useAuth } from '../lib/auth'
import { GAMES } from '../lib/games-registry'
import { fetchLeaderboard, fetchMyScores, levelToGame, type LeaderboardResult, type LeaderboardRow, type MyScoreRow } from '../lib/scores'

// ─── Types ────────────────────────────────────────────────────────────────────
type Panel = 'games' | 'rankings' | 'myscores'

// ─── Sub-components ───────────────────────────────────────────────────────────

function GameCards({ t }: { t: (hu: string, en: string) => string }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">{t('Játékok', 'Games')}</h2>
      <p className="text-sm text-slate-500 mb-6">{t('Válassz egy játékot a kezdéshez', 'Choose a game to start')}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {GAMES.map(game => (
          game.available
            ? (
              <Link
                key={game.slug}
                to={`/games/${game.slug}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-400 hover:shadow-md transition-all flex flex-col group"
              >
                {game.image && (
                  <div className="w-full h-36 overflow-hidden bg-slate-100">
                    <img
                      src={game.image}
                      alt={t(game.titleHu, game.titleEn)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  {!game.image && <div className="text-4xl mb-3">{game.icon}</div>}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{t(game.titleHu, game.titleEn)}</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-4 flex-1">{t(game.descHu, game.descEn)}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {game.levels.map(l => (
                      <span key={l.id} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                        {l.id}. {t(l.titleHu, l.titleEn)}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center justify-center gap-2 bg-indigo-600 group-hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors w-full">
                    {t('Játszom!', 'Play!')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </Link>
            )
            : (
              <div key={game.slug} className="bg-white rounded-2xl border border-slate-100 overflow-hidden opacity-50 flex flex-col">
                {game.image && (
                  <div className="w-full h-36 overflow-hidden bg-slate-100">
                    <img src={game.image} alt={t(game.titleHu, game.titleEn)} className="w-full h-full object-cover grayscale" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  {!game.image && <div className="text-4xl mb-3">{game.icon}</div>}
                  <h3 className="text-lg font-bold text-slate-900">{t(game.titleHu, game.titleEn)}</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-4 flex-1">{t(game.descHu, game.descEn)}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {game.levels.map(l => (
                      <span key={l.id} className="text-xs bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full border border-slate-100">
                        {l.id}. {t(l.titleHu, l.titleEn)}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 px-3 py-2 rounded-xl text-center">{t('Hamarosan', 'Coming soon')}</span>
                </div>
              </div>
            )
        ))}
      </div>
    </div>
  )
}

// All-time rankings: game tabs → level sub-tabs → leaderboard
// Derives everything from GAMES registry — adding a game there is all that's needed.
function RankingsPanel({ t }: { t: (hu: string, en: string) => string }) {
  const { session } = useAuth()
  // Only show available games that have a scoreOffset defined
  const availableGames = GAMES.filter(g => g.available)
  const [gameIdx, setGameIdx] = useState(0)
  const [levelIdx, setLevelIdx] = useState(0)
  const [result, setResult] = useState<LeaderboardResult>({ top10: [], myEntry: null })
  const [loading, setLoading] = useState(false)

  const game = availableGames[gameIdx]
  const scoreLevel = game.scoreOffset + (game.levels[levelIdx]?.id ?? levelIdx + 1)
  const myEmail = session?.user?.email

  useEffect(() => {
    if (!game) return
    setLoading(true)
    setResult({ top10: [], myEntry: null })
    fetchLeaderboard(scoreLevel, myEmail).then(data => { setResult(data); setLoading(false) })
  }, [scoreLevel, myEmail, game])

  function renderRow(row: LeaderboardRow, rank: number, isMe: boolean) {
    return (
      <tr key={rank} className={`border-b border-slate-50 last:border-0 ${isMe ? 'bg-indigo-50' : ''}`}>
        <td className="py-3 pr-2 text-lg">
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : <span className="text-slate-400 text-sm">{rank}</span>}
        </td>
        <td className="py-3 font-medium text-slate-800 max-w-[140px] truncate">
          {row.user_email.split('@')[0]}
          {isMe && <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">Te</span>}
        </td>
        <td className="py-3 text-right font-black text-slate-900 text-base">{row.score}</td>
        <td className="py-3 text-right text-slate-400 text-xs hidden sm:table-cell">{row.accuracy_points}</td>
        <td className="py-3 text-right text-slate-400 text-xs hidden sm:table-cell">{row.time_bonus}</td>
        <td className="py-3 text-right text-slate-400 text-xs hidden sm:table-cell">{row.quiz_points}</td>
      </tr>
    )
  }

  const tableHead = (
    <thead>
      <tr className="text-xs text-slate-400 border-b border-slate-100">
        <th className="pb-3 text-left w-8">#</th>
        <th className="pb-3 text-left">{t('Játékos', 'Player')}</th>
        <th className="pb-3 text-right">{t('Összpont', 'Score')}</th>
        <th className="pb-3 text-right hidden sm:table-cell">{t('Pontosság', 'Accuracy')}</th>
        <th className="pb-3 text-right hidden sm:table-cell">{t('Időbónusz', 'Time')}</th>
        <th className="pb-3 text-right hidden sm:table-cell">{t('Kvíz', 'Quiz')}</th>
      </tr>
    </thead>
  )

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">{t('All Time Rankings', 'All Time Rankings')}</h2>
      <p className="text-sm text-slate-500 mb-6">{t('A legjobb eredmények játékonként', 'Best scores per game')}</p>

      {/* Game tabs — auto-generated from GAMES registry */}
      <div className="flex flex-wrap gap-2 mb-5">
        {availableGames.map((g, i) => (
          <button
            key={g.slug}
            onClick={() => { setGameIdx(i); setLevelIdx(0) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${gameIdx === i ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
          >
            <span>{g.icon}</span>
            {t(g.titleHu, g.titleEn)}
          </button>
        ))}
      </div>

      {/* Level sub-tabs — auto-generated from selected game's levels */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {(game?.levels ?? []).map((lvl, i) => (
          <button
            key={lvl.id}
            onClick={() => setLevelIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${levelIdx === i ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'}`}
          >
            {lvl.id}. {t(lvl.titleHu, lvl.titleEn)}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        {loading ? (
          <div className="text-center py-10 text-slate-400 text-sm">{t('Betöltés…', 'Loading…')}</div>
        ) : result.top10.length === 0 && !result.myEntry ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            {t('Még nincs eredmény ezen a szinten.', 'No scores yet for this level.')}
          </div>
        ) : (
          <table className="w-full text-sm">
            {tableHead}
            <tbody>
              {result.top10.map((row, i) => renderRow(row, i + 1, row.user_email === myEmail))}
              {result.myEntry && (
                <>
                  <tr><td colSpan={6} className="py-1"><div className="border-t-2 border-dashed border-indigo-200 my-1" /></td></tr>
                  {renderRow(result.myEntry.row, result.myEntry.rank, true)}
                </>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function MyScoresPanel({ t }: { t: (hu: string, en: string) => string }) {
  const { session } = useAuth()
  const [rows, setRows] = useState<MyScoreRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return
    fetchMyScores(session.user.id).then(data => { setRows(data); setLoading(false) })
  }, [session])

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">{t('Saját eredményeim', 'My Results')}</h2>
      <p className="text-sm text-slate-500 mb-6">{t('A te korábbi játékaid és pontjaid', 'Your previous games and scores')}</p>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">{t('Betöltés…', 'Loading…')}</div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="text-5xl mb-4">🎮</div>
          <p className="text-slate-500 text-sm">{t('Még nincs lejátszott meccs. Válassz egy játékot!', 'No games played yet. Pick a game!')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 bg-slate-50 border-b border-slate-100">
                <th className="py-3 px-4 text-left">{t('Játék', 'Game')}</th>
                <th className="py-3 px-4 text-left hidden sm:table-cell">{t('Szint', 'Level')}</th>
                <th className="py-3 px-4 text-right">{t('Összpont', 'Score')}</th>
                <th className="py-3 px-4 text-right hidden md:table-cell">{t('Pontosság', 'Acc.')}</th>
                <th className="py-3 px-4 text-right hidden md:table-cell">{t('Idő', 'Time')}</th>
                <th className="py-3 px-4 text-right hidden md:table-cell">{t('Kvíz', 'Quiz')}</th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">{t('Dátum', 'Date')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const { game, displayLevel } = levelToGame(row.level)
                const date = new Date(row.created_at).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })
                const scoreColor = row.score >= 800 ? 'text-emerald-600' : row.score >= 500 ? 'text-amber-600' : 'text-slate-700'
                return (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">{game}</td>
                    <td className="py-3 px-4 text-slate-500 hidden sm:table-cell">{t(`${displayLevel}. szint`, `Level ${displayLevel}`)}</td>
                    <td className={`py-3 px-4 text-right font-black text-base ${scoreColor}`}>{row.score}</td>
                    <td className="py-3 px-4 text-right text-slate-400 text-xs hidden md:table-cell">{row.accuracy_points}</td>
                    <td className="py-3 px-4 text-right text-slate-400 text-xs hidden md:table-cell">{row.time_bonus}</td>
                    <td className="py-3 px-4 text-right text-slate-400 text-xs hidden md:table-cell">{row.quiz_points}</td>
                    <td className="py-3 px-4 text-right text-slate-400 text-xs hidden lg:table-cell">{date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: t('Lejátszott körök', 'Games played'), value: rows.length },
            { label: t('Legjobb eredmény', 'Best score'), value: Math.max(...rows.map(r => r.score)) },
            { label: t('Átlagos pont', 'Avg score'), value: Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-2xl font-black text-indigo-600">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main GamesPage ───────────────────────────────────────────────────────────
export default function GamesPage() {
  const { t, lang, setLang } = useI18n()
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const [panel, setPanel] = useState<Panel>('games')

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const NAV: { id: Panel; icon: string; labelHu: string; labelEn: string }[] = [
    { id: 'games',    icon: '🎮', labelHu: 'Játékok',          labelEn: 'Games' },
    { id: 'rankings', icon: '🏆', labelHu: 'All Time Rankings', labelEn: 'All Time Rankings' },
    { id: 'myscores', icon: '📊', labelHu: 'Saját eredményeim', labelEn: 'My Results' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col min-h-screen sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-4 py-3 border-b border-slate-100">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/microeconomicsgameslogo1.png" alt="MicroeconomicsGames" className="h-10 w-auto shrink-0" />
            <div className="flex flex-col justify-center min-w-0">
              <span className="font-black text-[10px] tracking-widest text-slate-800 uppercase leading-tight">PLAY · LEARN · MASTER!</span>
              <span className="text-[8px] text-slate-400 font-medium leading-tight mt-0.5 truncate">AI powered · by Sándor Oroján</span>
            </div>
          </a>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setPanel(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                panel === item.id
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {t(item.labelHu, item.labelEn)}
            </button>
          ))}
        </nav>

        {/* Bottom: lang toggle + user */}
        <div className="px-4 py-4 border-t border-slate-100 space-y-3">
          {/* Language toggle */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1 text-xs">
            <button
              onClick={() => setLang('hu')}
              className={`flex-1 py-1 rounded-md font-semibold transition-colors ${lang === 'hu' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
            >HU</button>
            <button
              onClick={() => setLang('en')}
              className={`flex-1 py-1 rounded-md font-semibold transition-colors ${lang === 'en' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
            >EN</button>
          </div>

          {session && (
            <div className="space-y-1">
              <div className="text-xs text-slate-400 truncate px-1">{session.user.email}</div>
              <button
                onClick={handleSignOut}
                className="w-full text-left text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-2 rounded-lg transition-colors"
              >
                {t('Kilépés', 'Sign out')}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 px-8 py-8 max-w-3xl">
        {panel === 'games'    && <GameCards t={t} />}
        {panel === 'rankings' && <RankingsPanel t={t} />}
        {panel === 'myscores' && <MyScoresPanel t={t} />}
      </main>
    </div>
  )
}
