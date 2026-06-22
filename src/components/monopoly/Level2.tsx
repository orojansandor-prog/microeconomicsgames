import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { solvePriceDiscrimination, solveMonopoly } from '../../engine/monopoly'
import { LEVEL2_SCENARIOS, pickRandom } from '../../engine/scenarios'
import { LEVEL2_QUIZ, pickQuestions } from '../../engine/quiz'
import { submitScore, calcTimeBonus } from '../../lib/scores'
import MonopolyChart from './charts/MonopolyChart'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import Leaderboard from '../Leaderboard'
import NotationBox from '../NotationBox'

type Phase = 'try' | 'quiz' | 'reveal'

const TOTAL_SECONDS = 120

export default function Level2() {
  const { t } = useI18n()
  const { session } = useAuth()

  const [sc] = useState(() => pickRandom(LEVEL2_SCENARIOS))
  const [phase, setPhase] = useState<Phase>('try')
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(LEVEL2_QUIZ, 3))
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  const [accuracyPoints, setAccuracyPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const M1 = sc.m1
  const M2 = sc.m2
  const MC = M1.MC

  const sol1 = solveMonopoly({ A: M1.A, B: M1.B, MC: M1.MC })
  const sol2 = solveMonopoly({ A: M2.A, B: M2.B, MC: M2.MC })
  const SOLUTION = solvePriceDiscrimination(
    { A: M1.A, B: M1.B, MC: M1.MC },
    { A: M2.A, B: M2.B, MC: M2.MC }
  )

  const [p1, setP1] = useState(() => Math.round(sol1.P_monopoly * 0.8 / 5) * 5)
  const [p2, setP2] = useState(() => Math.round(sol2.P_monopoly * 0.8 / 5) * 5)

  const q1 = Math.max(0, (M1.A - p1) / M1.B)
  const q2 = Math.max(0, (M2.A - p2) / M2.B)

  const handleTimerTick = (remaining: number) => {
    secondsRemainingRef.current = remaining
  }

  const handleTimerExpire = () => {
    setTimerRunning(false)
    if (phase === 'try') {
      setPhase('quiz')
    } else if (phase === 'quiz') {
      finishQuiz(0)
    }
  }

  const handleSubmit = () => {
    setPhase('quiz')
  }

  const finishQuiz = (correctCount: number) => {
    setTimerRunning(false)
    // Accuracy: average deviation of both prices from optimal
    const dev1 = Math.abs(p1 - SOLUTION.P1) / SOLUTION.P1
    const dev2 = Math.abs(p2 - SOLUTION.P2) / SOLUTION.P2
    const avgDev = (dev1 + dev2) / 2
    let ap = 30
    if (avgDev <= 0.02) ap = 500
    else if (avgDev <= 0.05) ap = 420
    else if (avgDev <= 0.10) ap = 320
    else if (avgDev <= 0.20) ap = 200
    else if (avgDev <= 0.30) ap = 100
    const tb = calcTimeBonus(secondsRemainingRef.current, TOTAL_SECONDS)
    const qp = correctCount * 100
    const total = ap + tb + qp
    setAccuracyPoints(ap)
    setTimeBonusState(tb)
    setQuizPoints(qp)
    setTotalScore(total)

    if (session) {
      submitScore({
        user_id: session.user.id,
        user_email: session.user.email ?? '',
        level: 2,
        score: total,
        accuracy_points: ap,
        time_bonus: tb,
        quiz_points: qp,
        time_taken_seconds: TOTAL_SECONDS - secondsRemainingRef.current,
        scenario_id: sc.id,
      }).then(() => setLeaderboardKey(k => k + 1))
    }

    setPhase('reveal')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-0.5">
              <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">← Dashboard</Link>
              <span>›</span>
              <Link to="/games/monopoly" className="hover:text-indigo-600 transition-colors">{t('Monopólium', 'Monopoly')}</Link>
              <span>›</span>
              <span className="text-slate-700 font-semibold">2. {t('Árdiszkrimináció', 'Price Discrimination')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{t('Szabj más árat a két vevőcsoportnak!', 'Set different prices for two buyer groups!')}</h1>
          </div>
          <div className="flex items-center gap-3">
            {phase !== 'reveal' && (
              <GameTimer totalSeconds={TOTAL_SECONDS} running={timerRunning} onExpire={handleTimerExpire} onTick={handleTimerTick} />
            )}
            <div className="flex items-center gap-1">
              <Link to="/games/monopoly/level/1" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">1</Link>
              <Link to="/games/monopoly/level/2" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-indigo-600 text-white shadow-sm">2</Link>
              <Link to="/games/monopoly/level/3" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">3</Link>
              <Link to="/games/monopoly/level/4" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">4</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        <NotationBox notations={[
          { symbol: 'P', full: 'Ár (Price)', note: 'a termék piaci ára' },
          { symbol: 'Q', full: 'Mennyiség (Quantity)', note: 'értékesített/termelt darabszám' },
          { symbol: 'TR', full: 'Teljes bevétel (Total Revenue)', formula: 'TR = P × Q', altSymbols: 'R, árbevétel' },
          { symbol: 'MR', full: 'Határbevétel (Marginal Revenue)', formula: 'MR = ΔTR / ΔQ', altSymbols: 'MB (marginal benefit)', note: 'egy extra egységből befolyó többletbevétel' },
          { symbol: 'MC', full: 'Határköltség (Marginal Cost)', formula: 'MC = ΔTC / ΔQ', altSymbols: 'MK (marginális költség)', note: 'egy extra egység előállításának pótlólagos költsége' },
          { symbol: 'π', full: 'Profit', formula: 'π = TR − TC', altSymbols: 'nyereség, Π' },
          { symbol: 'CS', full: 'Fogyasztói többlet (Consumer Surplus)', altSymbols: 'FS, FT', note: 'a fogyasztók "nyeresége" a tranzakción' },
          { symbol: 'PS', full: 'Termelői többlet (Producer Surplus)', altSymbols: 'TT, TS', note: 'a termelő profitja + fix költség feletti rész' },
          { symbol: 'DWL', full: 'Holtteher-veszteség (Deadweight Loss)', altSymbols: 'HV, jóléti veszteség' },
        ]} />
        {phase === 'try' && (
          <>
            {/* Szituáció */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-6">
              <div className="flex gap-4">
                <div className="text-4xl flex-shrink-0">{sc.icon}</div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base mb-1">{t(sc.titleHu, sc.titleEn)}</h2>
                  <p className="text-slate-700 leading-relaxed text-sm">{t(sc.storyHu, sc.storyEn)}</p>
                </div>
              </div>
            </div>

            {/* Jelmagyarázat */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-lg">📐</span>
                {t('Jelmagyarázat — az árdiszkrimináció kulcsfogalmai', 'Legend — key concepts of price discrimination')}
              </h2>
              <div className="space-y-2.5">
                {[
                  {
                    dot: 'bg-indigo-500',
                    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                    label: `${M1.icon} ${t(M1.labelHu, M1.labelEn)}: P = ${M1.A} − ${M1.B}Q`,
                    desc: t(
                      `Gazdagabb/rugalmatlanabb keresletű piac. MR = MC alapján optimális P₁* = ${sol1.P_monopoly} Ft, Q₁* = ${sol1.Q_monopoly}.`,
                      `Richer / more inelastic market. MR = MC gives optimal P₁* = ${sol1.P_monopoly}, Q₁* = ${sol1.Q_monopoly}.`,
                    ),
                  },
                  {
                    dot: 'bg-purple-500',
                    badge: 'bg-purple-50 text-purple-800 border-purple-200',
                    label: `${M2.icon} ${t(M2.labelHu, M2.labelEn)}: P = ${M2.A} − ${M2.B}Q`,
                    desc: t(
                      `Szűkösebb keresletű piac. Optimális P₂* = ${sol2.P_monopoly} Ft, Q₂* = ${sol2.Q_monopoly}.`,
                      `Tighter-budget market. Optimal P₂* = ${sol2.P_monopoly}, Q₂* = ${sol2.Q_monopoly}.`,
                    ),
                  },
                  {
                    dot: 'bg-emerald-500',
                    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    label: `MC = ${MC} Ft`,
                    desc: t(
                      `Mindkét piacon ugyanaz a termelési határköltség: ${MC} Ft/egység. Az MR = MC feltételt mindkét piacon külön kell alkalmazni.`,
                      `Same marginal cost in both markets: ${MC}/unit. Apply MR = MC separately in each market.`,
                    ),
                  },
                ].map(item => (
                  <div key={item.label} className="flex gap-3 p-3 rounded-xl bg-slate-50">
                    <div className={`w-1 rounded-full flex-shrink-0 ${item.dot}`} />
                    <div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${item.badge}`}>{item.label}</span>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Két csúszka */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Piac 1 */}
              <div className="bg-white rounded-2xl border-2 border-indigo-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{M1.icon}</span>
                  <h2 className="font-bold text-slate-800">{t(M1.labelHu, M1.labelEn)}</h2>
                </div>
                <div className="text-xs text-indigo-600 bg-indigo-50 rounded-lg px-2 py-1 mb-4 font-mono">
                  P = {M1.A} − {M1.B}Q
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">{t('Ár:', 'Price:')}</span>
                  <span className="text-3xl font-black text-indigo-600">{p1}</span>
                </div>
                <input type="range" min={MC} max={M1.A} step={5} value={p1}
                  onChange={e => setP1(Number(e.target.value))}
                  className="w-full accent-indigo-600" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>MC={MC}</span><span>{M1.A}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="text-xs text-slate-400">Q</div>
                    <div className="font-bold">{q1.toFixed(1)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="text-xs text-slate-400">P₁</div>
                    <div className="font-bold text-indigo-600">{p1} Ft</div>
                  </div>
                </div>
              </div>

              {/* Piac 2 */}
              <div className="bg-white rounded-2xl border-2 border-purple-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{M2.icon}</span>
                  <h2 className="font-bold text-slate-800">{t(M2.labelHu, M2.labelEn)}</h2>
                </div>
                <div className="text-xs text-purple-600 bg-purple-50 rounded-lg px-2 py-1 mb-4 font-mono">
                  P = {M2.A} − {M2.B}Q
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">{t('Ár:', 'Price:')}</span>
                  <span className="text-3xl font-black text-purple-600">{p2}</span>
                </div>
                <input type="range" min={MC} max={M2.A} step={5} value={p2}
                  onChange={e => setP2(Number(e.target.value))}
                  className="w-full accent-purple-600" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>MC={MC}</span><span>{M2.A}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="text-xs text-slate-400">Q</div>
                    <div className="font-bold">{q2.toFixed(1)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="text-xs text-slate-400">P₂</div>
                    <div className="font-bold text-purple-600">{p2} Ft</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                P₁ = {p1} Ft &nbsp;|&nbsp; P₂ = {p2} Ft
              </span>
              <span className="text-xs text-slate-500 italic">{t('Próbálj meg minél jobb árkombinációt találni!', 'Try to find the best price combination!')}</span>
            </div>

            <button onClick={handleSubmit}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-lg shadow-md">
              {t('Beküldöm az áraimat! →', 'Submit my prices! →')}
            </button>
          </>
        )}

        {phase === 'quiz' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <div>
                <h2 className="font-bold text-slate-900">{t('Gyors kvíz!', 'Quick quiz!')}</h2>
                <p className="text-xs text-slate-500">{t('Az óra még fut. Helyes válasz = +100 pont.', 'Timer is still running. Correct answer = +100 pts.')}</p>
              </div>
            </div>
            <QuizPanel questions={quizQuestions} onComplete={finishQuiz} />
          </div>
        )}

        {phase === 'reveal' && (
          <>
            {/* Pontszám kártya */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <h2 className="text-lg font-black mb-4">🏆 {t('Eredményed', 'Your score')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: t('Pontosság', 'Accuracy'), value: accuracyPoints, max: 500 },
                  { label: t('Időbónusz', 'Time bonus'), value: timeBonus, max: 300 },
                  { label: t('Kvíz', 'Quiz'), value: quizPoints, max: 300 },
                  { label: t('Összesen', 'Total'), value: totalScore, max: 1100, highlight: true },
                ].map(item => (
                  <div key={item.label} className={`rounded-xl p-3 text-center ${item.highlight ? 'bg-white/20 border-2 border-white/40' : 'bg-white/10'}`}>
                    <div className="text-xs text-indigo-200 mb-1">{item.label}</div>
                    <div className={`font-black ${item.highlight ? 'text-3xl text-white' : 'text-2xl text-indigo-100'}`}>{item.value}</div>
                    <div className="text-xs text-indigo-300">/ {item.max}</div>
                  </div>
                ))}
              </div>
              {!session && (
                <p className="text-xs text-indigo-200 text-center">
                  {t('Jelentkezz be az eredmény mentéséhez.', 'Sign in to save your score.')}
                </p>
              )}
            </div>

            {/* Optimum banner */}
            <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-6">
              <h2 className="text-lg font-black text-slate-900 mb-4">
                📊 {t('Optimális árdiszkrimináció — MR₁ = MC és MR₂ = MC', 'Optimal price discrimination — MR₁ = MC and MR₂ = MC')}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <div className="text-sm font-bold text-slate-700 mb-2">{M1.icon} {t(M1.labelHu, M1.labelEn)}</div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">P₁*</span><span className="font-bold text-indigo-700">{SOLUTION.P1} Ft</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Q₁*</span><span className="font-bold">{SOLUTION.Q1}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">π₁</span><span className="font-bold text-emerald-600">{SOLUTION.profit1} Ft</span></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <div className="text-sm font-bold text-slate-700 mb-2">{M2.icon} {t(M2.labelHu, M2.labelEn)}</div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">P₂*</span><span className="font-bold text-purple-700">{SOLUTION.P2} Ft</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Q₂*</span><span className="font-bold">{SOLUTION.Q2}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">π₂</span><span className="font-bold text-emerald-600">{SOLUTION.profit2} Ft</span></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-indigo-100 flex justify-between items-center">
                <span className="font-bold text-slate-700">{t('Max összesített profit', 'Max total profit')}</span>
                <span className="text-2xl font-black text-indigo-600">{SOLUTION.profit_total} Ft</span>
              </div>
            </div>

            {/* Grafikonok */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-sm text-slate-700 mb-3">{M1.icon} {t(M1.labelHu, M1.labelEn)}</h3>
                <MonopolyChart A={M1.A} B={M1.B} MC={MC} showMonopoly showDWL />
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-sm text-slate-700 mb-3">{M2.icon} {t(M2.labelHu, M2.labelEn)}</h3>
                <MonopolyChart A={M2.A} B={M2.B} MC={MC} showMonopoly showDWL />
              </div>
            </div>

            {/* Tanulság */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
              <h3 className="font-black text-indigo-900 text-lg mb-4">💡 {t('Tanulság', 'Key takeaway')}</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <h4 className="font-bold text-slate-900 mb-1.5">{t('Miért fizet többet a gazdagabb piac?', 'Why does the richer market pay more?')}</h4>
                  <p className="text-slate-600 leading-relaxed">
                    {t(
                      `A ${t(M1.labelHu, M1.labelEn)} kereslete rugalmatlanabb (meredekebb, kisebb B), ezért az MR = MC feltételből P₁* = ${SOLUTION.P1} Ft adódik. A ${t(M2.labelHu, M2.labelEn)} árérzékenyebb, ezért P₂* = ${SOLUTION.P2} Ft az optimum.`,
                      `${t(M1.labelHu, M1.labelEn)} has more inelastic demand (steeper, smaller B), so MR = MC yields P₁* = ${SOLUTION.P1}. ${t(M2.labelHu, M2.labelEn)} is more price-sensitive, so P₂* = ${SOLUTION.P2}.`,
                    )}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <h4 className="font-bold text-slate-900 mb-1.5">{t('Miért jobb ez a monopólistának mint az egységes ár?', 'Why is this better for the monopolist than a uniform price?')}</h4>
                  <p className="text-slate-600 leading-relaxed">
                    {t(
                      'Egységes árral az egyik piacot alulkiszolgálnád (alacsony áron) vagy kizárnád (magas áron). Árdiszkriminációval mindkét piacot a saját optimumán kezeled → a teljes profit a maximumot közelíti.',
                      "With a uniform price you'd either under-serve one market (too low) or exclude it (too high). With discrimination you treat each market at its own optimum → total profit approaches the maximum.",
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded-xl text-sm text-slate-600 border border-indigo-100">
                🌍 {t('Valós példa: repülőjegy-árazás. Business és economy osztály ugyanazon a gépen — az üzleti utas akár 5-10×-et fizet, mert a cége állja.', 'Real example: airline pricing. Business and economy on the same flight — the business traveller pays 5–10× more because the company covers it.')}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('Toplista — 2. szint', 'Leaderboard — Level 2')}</h2>
              <Leaderboard level={2} refreshKey={leaderboardKey} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setPhase('try'); setTimerRunning(true); secondsRemainingRef.current = TOTAL_SECONDS }}
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm">
                {t('← Újra', '← Retry')}
              </button>
              <Link to="/games/monopoly/level/3"
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md">
                {t('3. szint →', 'Level 3 →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
