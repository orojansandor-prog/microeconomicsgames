import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { submitScore } from '../../lib/scores'
import { pickQuestions } from '../../engine/supply-demand-quiz'
import { SD_LEVEL2_QUIZ } from '../../engine/supply-demand-quiz'
import { SD_LEVEL2_SCENARIOS, pickSDRandom } from '../../engine/supply-demand-scenarios'
import SupplyDemandChart from './charts/SupplyDemandChart'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import NotationBox from '../NotationBox'
import Leaderboard from '../Leaderboard'

type Phase = 'try' | 'quiz' | 'reveal'

const TOTAL_SECONDS = 300

function calcAccuracy(playerP: number, playerQ: number, shiftP: number, shiftQ: number): number {
  const priceErr = Math.abs(playerP - shiftP) / shiftP
  const qtyErr = Math.abs(playerQ - shiftQ) / shiftQ
  const avgErr = (priceErr + qtyErr) / 2
  if (avgErr <= 0.02) return 200
  if (avgErr <= 0.10) return 150
  if (avgErr <= 0.20) return 100
  if (avgErr <= 0.30) return 50
  return 10
}

export default function Level2() {
  const { t } = useI18n()
  const { session } = useAuth()

  const [sc] = useState(() => pickSDRandom(SD_LEVEL2_SCENARIOS))
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const ORIG = sc.orig
  const ORIG_Q = sc.origQ
  const ORIG_P = sc.origP
  const ORIG_CS = sc.origCS
  const ORIG_PS = sc.origPS
  const SHIFT = sc.shifted
  const SHIFT_Q = sc.shiftQ
  const SHIFT_P = sc.shiftP
  const SHIFT_CS = sc.shiftCS
  const SHIFT_PS = sc.shiftPS

  const [phase, setPhase] = useState<Phase>('try')
  const [playerPrice, setPlayerPrice] = useState(SHIFT_P)
  const [playerQty, setPlayerQty] = useState(Math.round((SHIFT_Q + ORIG_Q) / 2))
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(SD_LEVEL2_QUIZ, 3))

  // Inline reflection MCQ answers (unscored)
  const [demandAnswer, setDemandAnswer] = useState<number | null>(null)
  const [supplyAnswer, setSupplyAnswer] = useState<number | null>(null)

  const [accuracyPoints, setAccuracyPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const { A, Bd, C, Bs } = ORIG

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
    const ap = calcAccuracy(playerPrice, playerQty, SHIFT_P, SHIFT_Q)
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
        level: 6,
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

  const isCorrect = Math.abs(playerPrice - SHIFT_P) <= 5 && Math.abs(playerQty - SHIFT_Q) <= 5

  // Determine if demand shifted up/right (A increased) and supply shifted up/right (C decreased)
  const demandShiftedRight = SHIFT.A > ORIG.A
  const supplyShiftedRight = SHIFT.C < ORIG.C

  // Slider ranges based on scenario params
  const priceMax = Math.max(ORIG.A, SHIFT.A)
  const qtyMax = Math.round(Math.max(ORIG_Q, SHIFT_Q) * 2)

  // Equation labels
  const origDemandLabel = `P = ${A} − ${Bd === 1 ? '' : Bd}Q`
  const origSupplyLabel = `P = ${C} + ${Bs === 1 ? '' : Bs}Q`
  const shiftDemandLabel = `P = ${SHIFT.A} − ${SHIFT.Bd === 1 ? '' : SHIFT.Bd}Q`
  const shiftSupplyLabel = `P = ${SHIFT.C} + ${SHIFT.Bs === 1 ? '' : SHIFT.Bs}Q`

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
              <span className="text-slate-700 font-semibold">2. {t('Eltolódások', 'Shifts')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {t('Mi történik, ha mindkét görbe elmozdul?', 'What happens when both curves shift?')}
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
              <Link to="/games/supply-demand/level/1" className="w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">1</Link>
              <Link to="/games/supply-demand/level/2" className="w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-indigo-600 text-white shadow-sm">2</Link>
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
                  <div className="mt-2 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 px-2 py-1 rounded-lg inline-block">
                    {t(sc.shiftTypeHu, sc.shiftTypeEn)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">
                      {t('Eredeti kereslet', 'Original demand')}: {origDemandLabel}
                    </span>
                    <span className="text-xs bg-white border border-emerald-200 text-emerald-700 px-2 py-1 rounded-lg font-semibold">
                      {t('Eredeti kínálat', 'Original supply')}: {origSupplyLabel}
                    </span>
                    <span className="text-xs bg-white border border-violet-200 text-violet-700 px-2 py-1 rounded-lg font-semibold">
                      {t('Új kereslet', 'New demand')}: {shiftDemandLabel}
                    </span>
                    <span className="text-xs bg-white border border-teal-200 text-teal-700 px-2 py-1 rounded-lg font-semibold">
                      {t('Új kínálat', 'New supply')}: {shiftSupplyLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Original chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {t(`Eredeti egyensúly — Q*=${ORIG_Q}, P*=${ORIG_P}`, `Original equilibrium — Q*=${ORIG_Q}, P*=${ORIG_P}`)}
              </h2>
              <SupplyDemandChart
                A={A} Bd={Bd} C={C} Bs={Bs}
                showEquilibrium
              />
            </div>

            {/* Inline reflection questions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">
                💭 {t('Gondold át: melyik irányba tolódnak a görbék?', 'Think: which direction do the curves shift?')}
              </h2>
              <div className="space-y-4">
                {/* Demand direction */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    {t('A kereslet melyik irányba tolódik?', 'Which direction does demand shift?')}
                  </p>
                  <div className="flex gap-2">
                    {[
                      { label: t('Jobbra (nő) →', 'Right (increases) →'), correct: demandShiftedRight },
                      { label: t('Balra (csökken) ←', 'Left (decreases) ←'), correct: !demandShiftedRight },
                    ].map((opt, i) => {
                      const selected = demandAnswer === i
                      const revealed = demandAnswer !== null
                      let cls = 'flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-all '
                      if (!revealed) {
                        cls += selected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-slate-200 hover:border-indigo-300 text-slate-700'
                      } else {
                        if (opt.correct) cls += 'border-emerald-400 bg-emerald-50 text-emerald-900'
                        else if (selected) cls += 'border-red-400 bg-red-50 text-red-800'
                        else cls += 'border-slate-200 text-slate-400'
                      }
                      return (
                        <button key={i} className={cls} onClick={() => setDemandAnswer(i)}>
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Supply direction */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    {t('A kínálat melyik irányba tolódik?', 'Which direction does supply shift?')}
                  </p>
                  <div className="flex gap-2">
                    {[
                      { label: t('Jobbra (nő) →', 'Right (increases) →'), correct: supplyShiftedRight },
                      { label: t('Balra (csökken) ←', 'Left (decreases) ←'), correct: !supplyShiftedRight },
                    ].map((opt, i) => {
                      const selected = supplyAnswer === i
                      const revealed = supplyAnswer !== null
                      let cls = 'flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-all '
                      if (!revealed) {
                        cls += selected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-slate-200 hover:border-indigo-300 text-slate-700'
                      } else {
                        if (opt.correct) cls += 'border-emerald-400 bg-emerald-50 text-emerald-900'
                        else if (selected) cls += 'border-red-400 bg-red-50 text-red-800'
                        else cls += 'border-slate-200 text-slate-400'
                      }
                      return (
                        <button key={i} className={cls} onClick={() => setSupplyAnswer(i)}>
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Prediction sliders */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-5">
                {t('Tippeld meg az ÚJ egyensúlyt!', 'Guess the NEW equilibrium!')}
              </h2>

              {/* Price slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    {t('Szerinted az új egyensúlyi ár:', 'Your predicted new equilibrium price:')}
                  </label>
                  <span className="text-3xl font-black text-indigo-600">{playerPrice}</span>
                </div>
                <input
                  type="range" min={0} max={priceMax} step={5} value={playerPrice}
                  onChange={e => setPlayerPrice(Number(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0</span><span>{priceMax}</span>
                </div>
              </div>

              {/* Quantity slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    {t('Szerinted az új egyensúlyi mennyiség:', 'Your predicted new equilibrium quantity:')}
                  </label>
                  <span className="text-3xl font-black text-emerald-600">{playerQty}</span>
                </div>
                <input
                  type="range" min={0} max={qtyMax} step={5} value={playerQty}
                  onChange={e => setPlayerQty(Number(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0</span><span>{qtyMax}</span>
                </div>
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
                  ? t('Tökéletes! Megtaláltad az új egyensúlyt.', 'Perfect! You found the new equilibrium.')
                  : t(`Te P=${playerPrice}, Q=${playerQty} — helyes: P*=${SHIFT_P}, Q*=${SHIFT_Q}`, `You chose P=${playerPrice}, Q=${playerQty} — correct: P*=${SHIFT_P}, Q*=${SHIFT_Q}`)
                }
              </h2>
              <p className="text-sm text-slate-600 mb-2">
                {t(
                  `Új egyensúly: ${shiftDemandLabel} = ${shiftSupplyLabel} → Q* = ${SHIFT_Q}, P* = ${SHIFT_P}.`,
                  `New equilibrium: ${shiftDemandLabel} = ${shiftSupplyLabel} → Q* = ${SHIFT_Q}, P* = ${SHIFT_P}.`
                )}
              </p>
              {/* Animated transition */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="bg-white rounded-xl px-4 py-2 text-center shadow-sm border border-slate-200">
                  <div className="text-xs text-slate-500">{t('Eredeti', 'Original')}</div>
                  <div className="font-bold text-slate-800">Q*={ORIG_Q}, P*={ORIG_P}</div>
                </div>
                <div className="text-2xl text-indigo-500 font-black">→</div>
                <div className="bg-indigo-600 text-white rounded-xl px-4 py-2 text-center shadow-sm">
                  <div className="text-xs text-indigo-200">{t('Új', 'New')}</div>
                  <div className="font-bold">Q*={SHIFT_Q}, P*={SHIFT_P}</div>
                </div>
              </div>
            </div>

            {/* Chart with both curve sets */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {t('Eredeti és eltolt görbék', 'Original and shifted curves')}
              </h2>
              <SupplyDemandChart
                A={A} Bd={Bd} C={C} Bs={Bs}
                showEquilibrium
                shiftedA={SHIFT.A}
                shiftedC={SHIFT.C}
              />
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
                  {t('Kereslet (eredeti)', 'Demand (original)')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-300 inline-block" />
                  {t('Kereslet (új, szaggatott)', 'Demand (new, dashed)')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                  {t('Kínálat (eredeti)', 'Supply (original)')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-300 inline-block" />
                  {t('Kínálat (új, szaggatott)', 'Supply (new, dashed)')}
                </span>
              </div>
            </div>

            {/* Comparison table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">
                {t('Összehasonlítás', 'Comparison')}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide"></th>
                      <th className="text-right py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{t('Eredeti', 'Original')}</th>
                      <th className="text-right py-2 px-3 text-xs font-bold text-indigo-500 uppercase tracking-wide">{t('Új', 'New')}</th>
                      <th className="text-right py-2 px-3 text-xs font-bold text-emerald-500 uppercase tracking-wide">{t('Változás', 'Change')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Q*', orig: ORIG_Q, next: SHIFT_Q },
                      { label: 'P*', orig: ORIG_P, next: SHIFT_P },
                      { label: 'CS', orig: ORIG_CS, next: SHIFT_CS },
                      { label: 'PS', orig: ORIG_PS, next: SHIFT_PS },
                    ].map(row => {
                      const diff = row.next - row.orig
                      return (
                        <tr key={row.label} className="border-b border-slate-100">
                          <td className="py-2 px-3 font-bold text-slate-700">{row.label}</td>
                          <td className="py-2 px-3 text-right text-slate-500">{row.orig}</td>
                          <td className="py-2 px-3 text-right font-bold text-indigo-700">{row.next}</td>
                          <td className={`py-2 px-3 text-right font-bold ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                            {diff > 0 ? '+' : ''}{diff}
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
                      'Mindkét görbe jobbra tolódott — a mennyiség biztosan nő. Az ár iránya az eltolódások relatív nagyságától függ: itt a keresleti hatás erősebb volt, ezért az ár is nőtt, de csak kis mértékben.',
                      'Both curves shifted right — quantity definitely rises. The price direction depends on the relative size of the shifts: here the demand effect was stronger, so price also rose, but only slightly.'
                    )}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <div className="text-xs font-bold text-indigo-700 mb-1.5">📱 {t('Valós példa', 'Real example')}</div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {t(
                      'Okostelefonok: a technológia olcsóbbá tette a gyártást (kínálat jobbra), de a kereslet is robbanásszerűen nőtt (kereslet jobbra) → sokszoros mennyiség, az ár lassan csökkent.',
                      'Smartphones: technology made production cheaper (supply right), but demand also exploded (demand right) → far more units sold, price slowly fell.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            
            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('2. szint (SD)', 'Level 2 (SD)')}</h2>
              <Leaderboard level={6} refreshKey={leaderboardKey} />
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Link
                to="/games/supply-demand/level/1"
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm text-center"
              >
                {t('← 1. szint', '← Level 1')}
              </Link>
              <Link
                to="/games/supply-demand/level/3"
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md"
              >
                {t('3. szint →', 'Level 3 →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
