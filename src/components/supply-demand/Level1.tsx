import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { submitScore } from '../../lib/scores'
import { pickQuestions } from '../../engine/supply-demand-quiz'
import { SD_LEVEL1_QUIZ } from '../../engine/supply-demand-quiz'
import { SD_LEVEL1_SCENARIOS, pickSDRandom } from '../../engine/supply-demand-scenarios'
import SupplyDemandChart from './charts/SupplyDemandChart'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import NotationBox from '../NotationBox'
import Leaderboard from '../Leaderboard'

type Phase = 'try' | 'quiz' | 'reveal'

const TOTAL_SECONDS = 300

function calcAccuracy(playerP: number, playerQ: number, optP: number, optQ: number): number {
  const priceErr = Math.abs(playerP - optP) / optP
  const qtyErr = Math.abs(playerQ - optQ) / optQ
  const avgErr = (priceErr + qtyErr) / 2
  if (avgErr <= 0.02) return 200
  if (avgErr <= 0.10) return 150
  if (avgErr <= 0.20) return 100
  if (avgErr <= 0.30) return 50
  return 10
}

export default function Level1() {
  const { t } = useI18n()
  const { session } = useAuth()

  const [sc] = useState(() => pickSDRandom(SD_LEVEL1_SCENARIOS))
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const OPT_P = sc.optP
  const OPT_Q = sc.optQ

  const [phase, setPhase] = useState<Phase>('try')
  const [playerPrice, setPlayerPrice] = useState(50)
  const [playerQty, setPlayerQty] = useState(40)
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(SD_LEVEL1_QUIZ, 3))

  const [accuracyPoints, setAccuracyPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const { A, Bd, C, Bs } = sc.params

  // Live feedback: at player's price, compute Qd and Qs
  const Qd = Math.round((A - playerPrice) / Bd)
  const Qs = Math.round((playerPrice - C) / Bs)
  const balance = Qd - Qs

  const handleTimerTick = (remaining: number) => {
    secondsRemainingRef.current = remaining
  }

  const handleTimerExpire = () => {
    setTimerRunning(false)
    if (phase === 'try') setPhase('quiz')
    else if (phase === 'quiz') finishQuiz(0)
  }

  const handleSubmit = () => {
    setPhase('quiz')
  }

  const finishQuiz = (correctCount: number) => {
    setTimerRunning(false)
    const ap = calcAccuracy(playerPrice, playerQty, OPT_P, OPT_Q)
    const remaining = secondsRemainingRef.current
    const tb = remaining > TOTAL_SECONDS * 0.75 ? 100 : remaining > TOTAL_SECONDS * 0.5 ? 50 : 0
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
        level: 5,
        score: total,
        accuracy_points: ap,
        time_bonus: tb,
        quiz_points: qp,
        time_taken_seconds: TOTAL_SECONDS - remaining,
        scenario_id: sc.id,
      }).then(() => setLeaderboardKey(k => k + 1))
    }

    setPhase('reveal')
  }

  const isCorrect = Math.abs(playerPrice - OPT_P) <= 5 && Math.abs(playerQty - OPT_Q) <= 5

  // Data table: step from C to A in 9 steps
  const tableStep = Math.round((A - C) / 8)
  const tableRows = Array.from({ length: 9 }, (_, i) => {
    const P = C + i * tableStep
    const qd = Math.round((A - P) / Bd)
    const qs = Math.round((P - C) / Bs)
    const diff = qd - qs
    return { P, qd, qs, diff }
  })

  // Derive demand/supply label strings from params
  const demandLabel = `P = ${A} − ${Bd === 1 ? '' : Bd}Q`
  const supplyLabel = `P = ${C} + ${Bs === 1 ? '' : Bs}Q`

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-0.5">
              <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">← Dashboard</Link>
              <span>›</span>
              <Link to="/games/supply-demand" className="hover:text-indigo-600 transition-colors">
                {t('Kereslet-kínálat', 'Supply & Demand')}
              </Link>
              <span>›</span>
              <span className="text-slate-700 font-semibold">1. {t('Egyensúly', 'Equilibrium')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {t('Hol találkozik a kereslet és a kínálat?', 'Where do supply and demand meet?')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {phase !== 'reveal' && (
              <GameTimer
                totalSeconds={TOTAL_SECONDS}
                running={timerRunning}
                onExpire={handleTimerExpire}
                onTick={handleTimerTick}
              />
            )}
            <div className="flex items-center gap-1">
              <Link to="/games/supply-demand/level/1" className="w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-indigo-600 text-white shadow-sm">1</Link>
              <Link to="/games/supply-demand/level/2" className="w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">2</Link>
              <Link to="/games/supply-demand/level/3" className="w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">3</Link>
              <Link to="/games/supply-demand/level/4" className="w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">4</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <NotationBox notations={[
          { symbol: 'P', full: 'Ár (Price)' },
          { symbol: 'Q', full: 'Mennyiség (Quantity)' },
          { symbol: 'Qd', full: 'Keresett mennyiség (Quantity Demanded)', altSymbols: 'D, keresleti mennyiség' },
          { symbol: 'Qs', full: 'Kínált mennyiség (Quantity Supplied)', altSymbols: 'S, kínálati mennyiség' },
          { symbol: 'P*', full: 'Egyensúlyi ár (Equilibrium Price)', altSymbols: 'Pe, Peq' },
          { symbol: 'Q*', full: 'Egyensúlyi mennyiség (Equilibrium Quantity)', altSymbols: 'Qe, Qeq' },
          { symbol: 'CS', full: 'Fogyasztói többlet (Consumer Surplus)', altSymbols: 'FS, FT' },
          { symbol: 'PS', full: 'Termelői többlet (Producer Surplus)', altSymbols: 'TT, TS' },
          { symbol: 'DWL', full: 'Holtteher-veszteség (Deadweight Loss)', altSymbols: 'HV, jóléti veszteség' },
        ]} />

        {/* TRY PHASE */}
        {phase === 'try' && (
          <>
            {/* Story card */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-6">
              <div className="flex gap-4">
                <div className="text-4xl flex-shrink-0">{sc.icon}</div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base mb-1">
                    {t(sc.titleHu, sc.titleEn)}
                  </h2>
                  <p className="text-slate-700 leading-relaxed text-sm">
                    {t(sc.storyHu, sc.storyEn)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">
                      {t('Kereslet', 'Demand')}: {demandLabel}
                    </span>
                    <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">
                      {t('Kínálat', 'Supply')}: {supplyLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-3">
                {t('Élő grafikon', 'Live chart')}
              </h2>
              <SupplyDemandChart
                A={A} Bd={Bd} C={C} Bs={Bs}
                playerPrice={playerPrice}
                playerQty={playerQty}
              />
            </div>

            {/* Sliders */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-5">
                {t('Tippeld meg az egyensúlyt!', 'Guess the equilibrium!')}
              </h2>

              {/* Price slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    {t('Egyensúlyi ár (P*)', 'Equilibrium price (P*)')}
                  </label>
                  <span className="text-3xl font-black text-indigo-600">{playerPrice}</span>
                </div>
                <input
                  type="range" min={0} max={A} step={5} value={playerPrice}
                  onChange={e => setPlayerPrice(Number(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0</span><span>{A}</span>
                </div>
              </div>

              {/* Quantity slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    {t('Egyensúlyi mennyiség (Q*)', 'Equilibrium quantity (Q*)')}
                  </label>
                  <span className="text-3xl font-black text-emerald-600">{playerQty}</span>
                </div>
                <input
                  type="range" min={0} max={Math.round((A - C) / Math.min(Bd, Bs) * 1.5)} step={5} value={playerQty}
                  onChange={e => setPlayerQty(Number(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0</span><span>{Math.round((A - C) / Math.min(Bd, Bs) * 1.5)}</span>
                </div>
              </div>

              {/* Live feedback */}
              <div className="mt-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  {t('Élő visszajelzés az áradnál', 'Live feedback at your price')}
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">Qd</div>
                    <div className="text-xl font-black text-indigo-600">{Math.max(0, Qd)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">Qs</div>
                    <div className="text-xl font-black text-emerald-600">{Math.max(0, Qs)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">{t('Különbség', 'Diff')}</div>
                    <div className="text-xl font-black text-slate-700">{balance}</div>
                  </div>
                </div>
                {balance > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-sm font-semibold text-red-700 text-center">
                    {t(`Hiány: ${balance} egység`, `Shortage: ${balance} units`)}
                  </div>
                )}
                {balance < 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm font-semibold text-amber-700 text-center">
                    {t(`Felesleg: ${Math.abs(balance)} egység`, `Surplus: ${Math.abs(balance)} units`)}
                  </div>
                )}
                {balance === 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm font-semibold text-emerald-700 text-center">
                    {t('✓ Egyensúly!', '✓ Equilibrium!')}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-lg shadow-md hover:shadow-lg"
            >
              {t('Beküldöm! →', 'Submit! →')}
            </button>
          </>
        )}

        {/* QUIZ PHASE */}
        {phase === 'quiz' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <div>
                <h2 className="font-bold text-slate-900">{t('Gyors kvíz!', 'Quick quiz!')}</h2>
                <p className="text-xs text-slate-500">
                  {t('Az óra még fut. Helyes válasz = +100 pont.', 'Timer is still running. Correct answer = +100 pts.')}
                </p>
              </div>
            </div>
            <QuizPanel questions={quizQuestions} onComplete={finishQuiz} />
          </div>
        )}

        {/* REVEAL PHASE */}
        {phase === 'reveal' && (
          <>
            {/* Score card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <h2 className="text-lg font-black mb-4">🏆 {t('Eredményed', 'Your score')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: t('Pontosság', 'Accuracy'), value: accuracyPoints, max: 200 },
                  { label: t('Időbónusz', 'Time bonus'), value: timeBonus, max: 100 },
                  { label: t('Kvíz', 'Quiz'), value: quizPoints, max: 300 },
                  { label: t('Összesen', 'Total'), value: totalScore, max: 600, highlight: true },
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

            {/* Result banner */}
            <div className={`rounded-2xl border-2 p-6 ${isCorrect
              ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50'
              : 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50'}`}>
              <div className="text-4xl mb-2">{isCorrect ? '🎯' : '📊'}</div>
              <h2 className="text-xl font-black text-slate-900 mb-1">
                {isCorrect
                  ? t('Tökéletes! Megtaláltad az egyensúlyi pontot.', 'Perfect! You found the equilibrium.')
                  : t(`Te P=${playerPrice}, Q=${playerQty} — helyes: P*=${OPT_P}, Q*=${OPT_Q}`, `You chose P=${playerPrice}, Q=${playerQty} — correct: P*=${OPT_P}, Q*=${OPT_Q}`)
                }
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                {t(
                  `Az egyensúlyi feltétel: Qd = Qs → ${A} − Q = ${C} + Q → Q* = ${OPT_Q}, P* = ${OPT_P}.`,
                  `Equilibrium condition: Qd = Qs → ${A} − Q = ${C} + Q → Q* = ${OPT_Q}, P* = ${OPT_P}.`
                )}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Q*', value: OPT_Q, color: 'text-indigo-700' },
                  { label: 'P*', value: OPT_P, color: 'text-indigo-700' },
                  { label: 'CS', value: Math.round(0.5 * (A - OPT_P) * OPT_Q), color: 'text-blue-700' },
                  { label: 'PS', value: Math.round(0.5 * (OPT_P - C) * OPT_Q), color: 'text-emerald-700' },
                ].map(item => (
                  <div key={item.label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                    <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart with CS and PS shaded */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {t('Grafikon — CS és PS terület', 'Chart — CS and PS areas')}
              </h2>
              <SupplyDemandChart
                A={A} Bd={Bd} C={C} Bs={Bs}
                showEquilibrium showCS showPS
              />
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-400 inline-block" />
                  {t(`CS = fogyasztói többlet (${Math.round(0.5 * (A - OPT_P) * OPT_Q)})`, `CS = consumer surplus (${Math.round(0.5 * (A - OPT_P) * OPT_Q)})`)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
                  {t(`PS = termelői többlet (${Math.round(0.5 * (OPT_P - C) * OPT_Q)})`, `PS = producer surplus (${Math.round(0.5 * (OPT_P - C) * OPT_Q)})`)}
                </span>
              </div>
            </div>

            {/* Data table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">
                {t('Adattábla — Qd, Qs és egyensúly', 'Data table — Qd, Qs and balance')}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">P</th>
                      <th className="text-right py-2 px-3 text-xs font-bold text-indigo-500 uppercase tracking-wide">Qd</th>
                      <th className="text-right py-2 px-3 text-xs font-bold text-emerald-500 uppercase tracking-wide">Qs</th>
                      <th className="text-right py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {t('Egyensúly', 'Balance')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map(row => {
                      const isEq = row.diff === 0
                      return (
                        <tr key={row.P} className={`border-b border-slate-100 ${isEq ? 'bg-emerald-50 font-bold' : ''}`}>
                          <td className="py-2 px-3">{row.P}</td>
                          <td className="py-2 px-3 text-right text-indigo-700">{Math.max(0, row.qd)}</td>
                          <td className="py-2 px-3 text-right text-emerald-700">{Math.max(0, row.qs)}</td>
                          <td className="py-2 px-3 text-right">
                            {isEq ? (
                              <span className="text-emerald-600">✓ {t('Egyensúly', 'Equilibrium')}</span>
                            ) : row.diff > 0 ? (
                              <span className="text-red-500">{t(`Hiány: ${row.diff}`, `Shortage: ${row.diff}`)}</span>
                            ) : (
                              <span className="text-amber-500">{t(`Felesleg: ${Math.abs(row.diff)}`, `Surplus: ${Math.abs(row.diff)}`)}</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lesson */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-6">
              <h3 className="font-black text-indigo-900 text-lg mb-4">
                💡 {t('Tanulság', 'Key takeaway')}
              </h3>
              <div className="space-y-3 text-sm leading-relaxed">
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <p className="text-slate-700">
                    {t(
                      'A versenypiaci egyensúly ott alakul ki, ahol a kínált és keresett mennyiség megegyezik — nincs sem hiány, sem felesleg. Az ár automatikusan ebbe az irányba mozdul, ha eltér az egyensúlytól.',
                      'Competitive market equilibrium occurs where quantity supplied equals quantity demanded — no shortage, no surplus. The price automatically moves toward equilibrium when it deviates.'
                    )}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <div className="text-xs font-bold text-indigo-700 mb-1.5">🍺 {t('Valós példa', 'Real example')}</div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {t(
                      'Fesztiválon egymás mellett lévő sörös standok — aki magasabb árat kér, elveszíti a vevőit, aki alacsonyabbat, elfogy a készlete. A piac maga rendezi az egyensúlyt.',
                      'Beer stalls at a festival side by side — whoever charges more loses customers, whoever charges less runs out of stock. The market self-corrects to equilibrium.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            
            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('1. szint (SD)', 'Level 1 (SD)')}</h2>
              <Leaderboard level={5} refreshKey={leaderboardKey} />
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => { setPhase('try'); setTimerRunning(true); secondsRemainingRef.current = TOTAL_SECONDS }}
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm"
              >
                {t('← Újra', '← Try again')}
              </button>
              <Link
                to="/games/supply-demand/level/2"
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md"
              >
                {t('2. szint — Eltolódások →', 'Level 2 — Shifts →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
