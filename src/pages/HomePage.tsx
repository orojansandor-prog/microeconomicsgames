import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'
import { GAMES } from '../lib/games-registry'
import Navbar from '../components/Navbar'
import Leaderboard from '../components/Leaderboard'
import { fetchGlobalLeaderboard, type GlobalLeaderboardRow } from '../lib/scores'

// profile-photo-version-1782076353
export default function HomePage() {
  const { session } = useAuth()
  const { t } = useI18n()

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  // Leaderboard tab: 'global' | game slug
  const [lbTab, setLbTab] = useState<'global' | string>('global')
  const [lbLevel, setLbLevel] = useState(0) // index within selected game's levels
  const [globalRows, setGlobalRows] = useState<GlobalLeaderboardRow[]>([])
  const [globalLoading, setGlobalLoading] = useState(true)

  useEffect(() => {
    fetchGlobalLeaderboard().then(rows => { setGlobalRows(rows); setGlobalLoading(false) })
  }, [])

  const [submitting, setSubmitting] = useState(false)

  const encode = (data: Record<string, string>) =>
    Object.entries(data)
      .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
      .join('&')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'contact', ...form }),
      })
      setSubmitted(true)
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      alert(t('Hiba történt. Kérlek próbáld újra.', 'An error occurred. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ── 1. HERO ──────────────────────────────────────────────── */}

      {/* Mobile hero: kép + szöveg egymás alatt */}
      <section className="sm:hidden bg-slate-950">
        <img
          src="/microgameshero2.png"
          alt=""
          className="w-full object-cover max-h-56"
        />
        <div className="px-5 py-8 text-center">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">
            Microeconomics
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-200">
              Games
            </span>
          </h1>
          <p className="mt-3 text-base text-indigo-200 font-light leading-relaxed">
            Learn Economics Through Play and AI.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {t(
              'Interaktív játékok, MI-tutor és valós példák — a mikroökonómia most már élmény.',
              'Interactive games, AI tutoring, and real-world examples — microeconomics as an experience.',
            )}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to={session ? '/dashboard' : '/login'}
              className="shimmer-btn inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg text-base"
            >
              {t('Játékok megnyitása', 'Explore the games')}
              <span>→</span>
            </Link>
            <a
              href="#mi-ez"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl text-base"
            >
              {t('Tudj meg többet', 'Learn more')}
            </a>
          </div>
        </div>
      </section>

      {/* Desktop hero: overlay megmarad */}
      <section className="hidden sm:block relative">
        <img
          src="/microgameshero2.png"
          alt=""
          className="w-full object-contain"
        />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: 'rgba(0,0,0,0.30)' }} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 70% at 52% 50%, rgba(0,0,20,0.50) 0%, transparent 100%)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
              Microeconomics
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-200">
                Games
              </span>
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-indigo-100 font-light leading-relaxed drop-shadow">
              Learn Economics Through Play and AI.
            </p>
            <p className="mt-3 text-sm text-indigo-200/90 drop-shadow">
              {t(
                'Interaktív játékok, MI-tutor és valós példák — a mikroökonómia most már élmény.',
                'Interactive games, AI tutoring, and real-world examples — microeconomics as an experience.',
              )}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={session ? '/dashboard' : '/login'}
                className="shimmer-btn inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-7 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-indigo-50 transition-all text-base group w-full sm:w-auto justify-center"
              >
                {t('Játékok megnyitása', 'Explore the games')}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <a
                href="#mi-ez"
                className="shimmer-btn inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-2xl hover:bg-white/25 transition-all text-base backdrop-blur-sm w-full sm:w-auto justify-center"
              >
                {t('Tudj meg többet', 'Learn more')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1b. STATS SÁV — hero alatt ── */}
      <div className="bg-indigo-950 border-t border-indigo-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-4 gap-2 sm:gap-0 sm:flex sm:items-center sm:justify-center sm:gap-16">
          {[
            { n: String(GAMES.filter(g => g.available).length), label: t('Játék', 'Games') },
            { n: '4', label: t('Szint', 'Levels') },
            { n: 'AI', label: t('Tutor', 'Tutor') },
            { n: '∞', label: t('Szcenárió', 'Scenarios') },
          ].map((item, i) => (
            <div key={item.label} className="flex items-center sm:gap-16">
              {i > 0 && <div className="hidden sm:block w-px h-8 bg-indigo-700 mr-16" />}
              <div className="text-center w-full">
                <div className="text-xl sm:text-2xl font-black text-white">{item.n}</div>
                <div className="text-[10px] sm:text-xs text-indigo-400 mt-0.5 uppercase tracking-wide">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. KÖSZÖNTŐ ──────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid md:grid-cols-3 gap-8 md:gap-10 items-start">
          {/* Szöveg — 2/3 */}
          <div className="md:col-span-2 space-y-5">
            <div className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full uppercase tracking-widest">
              {t('Üzenet az oktatótól', 'A note from the educator')}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              {t('Üdvözöllek a Microeconomics Games platformon!', 'Welcome to the Microeconomics Games platform!')}
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed text-[15px]">
              <p>
                {t(
                  'A mikroökonómia a közgazdaságtan egyik legfontosabb területe, ugyanakkor sok hallgató számára kihívást jelenthet az elméleti modellek és összefüggések megértése. A kereslet és kínálat, a fogyasztói döntések, a termelési folyamatok vagy a piaci szerkezetek első pillantásra gyakran száraz és nehezen megközelíthető témáknak tűnnek.',
                  'Microeconomics is one of the most important areas of economics, yet many students find it challenging to grasp its theoretical models and relationships. Supply and demand, consumer decisions, production processes, or market structures can seem dry and inaccessible at first glance.',
                )}
              </p>
              <p>
                {t(
                  'A Nyíregyházi Egyetem oktatójaként szenvedélyem a mikro- és makroökonómia oktatása. Mindig arra törekedtem, hogy a hallgatók számára érthetőbbé, gyakorlatiasabbá és élvezetesebbé tegyem a gazdasági ismeretek elsajátítását.',
                  'As a lecturer at the University of Nyíregyháza, teaching micro- and macroeconomics is my passion. I have always strived to make the acquisition of economic knowledge more understandable, practical, and enjoyable for students.',
                )}
              </p>
              <p>
                {t(
                  'A Microeconomics Games platformot azért hoztam létre, hogy a mikroökonómia tanulása új szintre léphessen. Az oldalon található játékok a legmodernebb mesterséges intelligencia technológiák támogatásával működnek, így interaktív, személyre szabott és folyamatosan fejlődő tanulási élményt kínálnak.',
                  'I created the Microeconomics Games platform to take the learning of microeconomics to a new level. The games on the site are powered by the most advanced AI technologies, offering an interactive, personalised, and continuously evolving learning experience.',
                )}
              </p>
              <p>
                {t(
                  'Hiszem, hogy a játékos tanulás hatékonyabbá és motiválóbbá teszi az oktatást. Kívánom, hogy a játékok segítségével élvezet legyen számodra a mikroökonómia izgalmas világának felfedezése, és magabiztosan vizsgázz a tanulmányaid végén!',
                  'I believe that playful learning makes education more effective and motivating. I hope that through these games exploring the exciting world of microeconomics becomes a joy for you, and that you ace your exams with confidence!',
                )}
              </p>
            </div>
          </div>

          {/* Aláíró kártya — 1/3 */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-6 text-center md:sticky md:top-24">
              <img
                src="/profile-photo-2.png"
                alt="Oroján Sándor"
                className="w-40 h-40 mx-auto rounded-full object-cover shadow-lg mb-4 border-2 border-indigo-100" style={{objectPosition: "center 20%"}}
              />
              <div className="font-bold text-slate-900 text-lg">Oroján Sándor</div>
              <div className="text-sm text-slate-500 mt-1">{t('Egyetemi oktató', 'University Lecturer')}</div>
              <div className="text-xs text-indigo-600 mt-1 font-semibold">{t('Nyíregyházi Egyetem', 'University of Nyíregyháza')}</div>
              <div className="mt-4 pt-4 border-t border-indigo-100 space-y-2">
                <div className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                  <span>🎓</span> {t('Mikro- és makroökonómia', 'Micro- and macroeconomics')}
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                  <span>🤖</span> {t('AI-alapú oktatásfejlesztés', 'AI-driven education')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. MI EZ? ────────────────────────────────────────────── */}
      <section id="mi-ez" className="bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-block text-xs font-bold text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
              {t('A platform', 'The platform')}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black leading-tight">
              {t('Mi a Microeconomics Games?', 'What is Microeconomics Games?')}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5 text-slate-300 leading-relaxed text-[15px]">
              <p>
                {t(
                  'A Microeconomics Games egy innovatív oktatási platform, amely a mikroökonómia tanulását interaktív, mesterséges intelligencia által támogatott játékok segítségével teszi élményszerűvé.',
                  'Microeconomics Games is an innovative educational platform that makes learning microeconomics experiential through interactive, AI-supported games.',
                )}
              </p>
              <p>
                {t(
                  'A rendszer célja, hogy a hagyományos tananyagokat modern technológiai eszközökkel egészítse ki, és a hallgatók számára könnyebben befogadhatóvá tegye a közgazdaságtan gyakran összetett fogalmait. A játékok különböző mikroökonómiai témaköröket dolgoznak fel, miközben aktív gondolkodásra, problémamegoldásra és döntéshozatalra ösztönzik a felhasználókat.',
                  'The system aims to complement traditional coursework with modern technology, making the often complex concepts of economics more accessible to students. The games cover various microeconomic topics while encouraging active thinking, problem-solving, and decision-making.',
                )}
              </p>
              <p>
                {t(
                  "A platform egyik különlegessége, hogy a játékok működését és fejlesztését mesterséges intelligencia támogatja — lehetővé téve a dinamikus feladatgenerálást, az intelligens visszajelzéseket és a személyre szabott tanulási élményt.",
                  "One of the platform's distinctive features is that its games are supported by artificial intelligence — enabling dynamic task generation, intelligent feedback, and a personalised learning experience.",
                )}
              </p>
            </div>
            {/* Feature badges */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { icon: '🎮', label: t('Játékos tanulás', 'Game-based learning') },
                { icon: '🤖', label: t('AI tutor', 'AI tutor') },
                { icon: '📊', label: t('Valós grafikonok', 'Real-time charts') },
                { icon: '🔀', label: t('Véletlen szcenáriók', 'Random scenarios') },
                { icon: '✅', label: t('Azonnali visszajelzés', 'Instant feedback') },
                { icon: '🌍', label: t('HU / EN kétnyelvű', 'HU / EN bilingual') },
              ].map(item => (
                <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 hover:bg-white/10 transition-colors">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{item.icon}</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-200 leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. MIÉRT HASZNÁLD? ───────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
            {t('Próbáld ki!', 'Try it!')}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
            {t('Miért érdemes használni?', 'Why use this platform?')}
          </h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
            {t(
              'Három ok, amiért a Microeconomics Games hatékonyabb tanulási eszköz, mint egy hagyományos tankönyv.',
              'Three reasons why Microeconomics Games is a more effective learning tool than a traditional textbook.',
            )}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {[
            {
              icon: '🧠',
              gradient: 'from-indigo-500 to-indigo-600',
              titleHu: 'Tanuld meg játékosan!',
              titleEn: 'Learn by playing!',
              descHu: 'A produktív kudarc elvén alapuló játékok először rávezetnek a problémára, aztán leplezik le a megoldást. Ez a tanulási ív mélyebb megértést eredményez, mint az előadásos oktatás.',
              descEn: 'Games built on the principle of productive failure first guide you to the problem, then reveal the solution. This learning arc produces deeper understanding than lecture-based teaching.',
              tags: ['Productive failure', t('Interaktív', 'Interactive')],
            },
            {
              icon: '🤖',
              gradient: 'from-violet-500 to-purple-600',
              titleHu: 'AI-tutor, ami mindig ráér',
              titleEn: 'An AI tutor always available',
              descHu: 'Minden szinten Szókratészi módszerrel kérdező AI-coach segít megérteni az összefüggéseket. Nem adja meg a választ — rávezet. Magyarul és angolul egyaránt, bármikor.',
              descEn: 'A Socratic AI coach at every level helps you understand the connections. It does not give you the answer — it leads you to it. In Hungarian and English alike, whenever you need it.',
              tags: ['Claude AI', t('24/7 elérhető', '24/7 available')],
            },
            {
              icon: '📈',
              gradient: 'from-emerald-500 to-teal-600',
              titleHu: 'Valós példák, valódi számok',
              titleEn: 'Real examples, real numbers',
              descHu: 'Az EpiPen-botrány, az EU gázár-plafon, az App Store monopóliuma — minden elméleti ponthoz valódi piaci esetek kapcsolódnak. A grafikonok és számok a determinisztikus közgazdasági motorból jönnek, nem közelítésekből.',
              descEn: 'The EpiPen scandal, the EU gas price cap, the App Store monopoly — real market cases accompany every theoretical point. Charts and numbers come from a deterministic economic engine, not approximations.',
              tags: [t('Valós esetek', 'Real cases'), t('Pontos számítások', 'Accurate math')],
            },
          ].map(item => (
            <div key={item.titleHu} className="group relative bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} rounded-t-2xl`} />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl mb-5 shadow-md`}>
                {item.icon}
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-3">{t(item.titleHu, item.titleEn)}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">{t(item.descHu, item.descEn)}</p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. LEADERBOARD ───────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-10">
          <div className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
            🏆 {t('Toplista', 'Leaderboard')}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
            {t('A legjobb játékosok', 'Top players')}
          </h2>
          <p className="mt-3 text-slate-500 text-sm max-w-md mx-auto">
            {t('Játssz és kerülj fel a toplistára! Összesített és szintenkénti rangsorok.', 'Play and make it onto the leaderboard! Combined and per-level rankings.')}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Game tabs row */}
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {/* Global / összesített tab */}
            <button
              onClick={() => { setLbTab('global'); setLbLevel(0) }}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                lbTab === 'global'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-transparent'
              }`}
            >
              🌍 {t('Összesített', 'Combined')}
            </button>
            {/* Per-game tabs — auto from registry */}
            {GAMES.filter(g => g.available).map(g => (
              <button
                key={g.slug}
                onClick={() => { setLbTab(g.slug); setLbLevel(0) }}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                  lbTab === g.slug
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-transparent'
                }`}
              >
                <span>{g.icon}</span>
                <span className="hidden sm:inline">{t(g.titleHu, g.titleEn)}</span>
              </button>
            ))}
          </div>

          {/* Level sub-tabs (only for game tabs) */}
          {lbTab !== 'global' && (() => {
            const selGame = GAMES.find(g => g.slug === lbTab)
            if (!selGame) return null
            return (
              <div className="flex gap-1 px-4 py-2.5 border-b border-slate-100 bg-slate-50 overflow-x-auto">
                {selGame.levels.map((lvl, i) => (
                  <button
                    key={lvl.id}
                    onClick={() => setLbLevel(i)}
                    className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      lbLevel === i
                        ? 'bg-slate-800 text-white'
                        : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    {lvl.id}. {t(lvl.titleHu, lvl.titleEn)}
                  </button>
                ))}
              </div>
            )
          })()}

          {/* Leaderboard content */}
          <div className="p-5">
            {lbTab === 'global' ? (
              globalLoading ? (
                <div className="text-center py-8 text-slate-400 text-sm">{t('Betöltés…', 'Loading…')}</div>
              ) : globalRows.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">{t('Még nincs eredmény.', 'No scores yet.')}</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 border-b border-slate-100">
                      <th className="pb-2 text-left w-8">#</th>
                      <th className="pb-2 text-left">{t('Játékos', 'Player')}</th>
                      <th className="pb-2 text-right">{t('Összpont', 'Total score')}</th>
                      <th className="pb-2 text-right hidden sm:table-cell">{t('Teljesített szintek', 'Levels done')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalRows.map((row, i) => {
                      const isMe = row.user_email === session?.user?.email
                      return (
                        <tr key={i} className={`border-b border-slate-50 last:border-0 ${isMe ? 'bg-indigo-50' : ''}`}>
                          <td className="py-2.5">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-slate-400">{i + 1}</span>}
                          </td>
                          <td className="py-2.5 font-medium text-slate-800 truncate max-w-[140px]">
                            {row.user_email.split('@')[0]}
                            {isMe && <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">{t('Te', 'You')}</span>}
                          </td>
                          <td className="py-2.5 text-right font-black text-slate-900 text-base">{row.total.toLocaleString('hu-HU')}</td>
                          <td className="py-2.5 text-right text-slate-400 text-xs hidden sm:table-cell">{row.gamesPlayed} {t('szint', 'levels')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )
            ) : (() => {
              const selGame = GAMES.find(g => g.slug === lbTab)
              if (!selGame) return null
              const scoreLevel = selGame.scoreOffset + (selGame.levels[lbLevel]?.id ?? lbLevel + 1)
              return <Leaderboard level={scoreLevel} />
            })()}
          </div>
        </div>
      </section>

      {/* ── 6. DONATION ──────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 border-y border-indigo-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
          <div className="text-4xl mb-5">☕</div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
            {t('Tetszik a platform? Támogasd!', 'Enjoying the platform? Support it!')}
          </h2>
          <p className="text-slate-600 leading-relaxed max-w-xl mx-auto mb-3 text-sm sm:text-base">
            {t(
              'A Microeconomics Games egy szabad időmben, önkéntes munkával fejlesztett projekt. Nincs mögötte intézményi finanszírozás — csak oktatói lelkesedés és egy jó adag kávé.',
              "Microeconomics Games is a project built in my spare time through voluntary work. There is no institutional funding behind it — just an educator's enthusiasm and a good deal of coffee.",
            )}
          </p>
          <p className="text-slate-600 leading-relaxed max-w-xl mx-auto mb-8 text-sm sm:text-base">
            {t(
              'Ha hasznosnak találod a platformot — legyen szó hallgatóról, oktatóról vagy kíváncsi érdeklődőről —, egy kis támogatás sokat jelent a fejlesztés folytatásához. Minden forint a platform fejlesztésébe, új játékokba és jobb AI-integrációba kerül.',
              "If you find the platform useful — whether you're a student, an educator, or simply a curious learner — a small contribution goes a long way toward continuing development. Every penny goes into the platform, new games, and better AI integration.",
            )}
          </p>
          <a
            href="https://buymeacoffee.com/orojansandor"
            target="_blank"
            rel="noopener noreferrer"
            className="shimmer-btn inline-flex items-center gap-2 bg-[#FFDD00] hover:bg-yellow-300 text-[#000000] font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-base group"
          >
            <span>☕</span>
            {t('Buy me a coffee', 'Buy me a coffee')}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
          <p className="mt-4 text-xs text-slate-400">
            {t('Köszönöm, hogy értékeled a munkát! 🙏', 'Thank you for valuing the work! 🙏')}
          </p>
        </div>
      </section>

      {/* ── 7. VISSZAJELZÉS ──────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-10">
          <div className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
            {t('Kapcsolat', 'Contact')}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('Küldd el észrevételeidet!', 'Send your feedback!')}
          </h2>
          <p className="mt-3 text-slate-500 text-sm">
            {t(
              'Hibát találtál? Ötleted van? Csak írj — minden visszajelzést szívesen fogadok.',
              'Found a bug? Have an idea? Just write — I welcome all feedback.',
            )}
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-bold text-emerald-800 text-lg mb-2">
              {t('Köszönöm az üzeneted!', 'Thank you for your message!')}
            </h3>
            <p className="text-emerald-700 text-sm">
              {t("Hamarosan visszajelzek.", "I'll get back to you shortly.")}
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-5 text-sm text-emerald-600 underline hover:no-underline"
            >
              {t('Újabb üzenet küldése', 'Send another message')}
            </button>
          </div>
        ) : (
          <form
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5"
          >
            <input type="hidden" name="form-name" value="contact" />
            <input name="bot-field" className="hidden" />
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t('Név', 'Name')} <span className="text-slate-400 font-normal">({t('opcionális', 'optional')})</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={t('Pl. Kovács Anna', 'E.g. Jane Smith')}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Email <span className="text-slate-400 font-normal">({t('opcionális', 'optional')})</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="example@email.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {t('Telefon', 'Phone')} <span className="text-slate-400 font-normal">({t('opcionális', 'optional')})</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+36 30 …"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {t('Megjegyzés', 'Message')} <span className="text-slate-400 font-normal">({t('opcionális', 'optional')})</span>
              </label>
              <textarea
                rows={5}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder={t('Írd le észrevételedet, javaslatodat…', 'Describe your observation, suggestion…')}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="shimmer-btn w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-colors text-base shadow-md hover:shadow-lg"
            >
              {submitting ? t('Küldés…', 'Sending…') : t('Elküldöm →', 'Send →')}
            </button>
          </form>
        )}
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 text-center py-10 text-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xl">📈</span>
            <span className="font-bold text-white text-sm">MicroeconomicsGames</span>
          </div>
          <p className="mb-1">
            {t(
              '© 2025 Oroján Sándor · Nyíregyházi Egyetem · Minden jog fenntartva.',
              '© 2025 Oroján Sándor · University of Nyíregyháza · All rights reserved.',
            )}
          </p>
          <p className="text-slate-600">
            {t('Powered by Claude AI · Determinisztikus közgazdasági motor', 'Powered by Claude AI · Deterministic economic engine')}
          </p>
        </div>
      </footer>
    </div>
  )
}
