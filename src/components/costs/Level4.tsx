import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { submitScore } from '../../lib/scores'
import { COST_SCENARIOS, pickCostRandom } from '../../engine/costs-scenarios'
import { COSTS_L4_QUIZ, pickQuestions } from '../../engine/costs-quiz'
import CostsChart from './charts/CostsChart'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import NotationBox from '../NotationBox'
import Leaderboard from '../Leaderboard'

type Phase = 'try' | 'quiz' | 'reveal'
const TOTAL_SECONDS = 300

export default function Level4() {
  const { t } = useI18n()
  const { session } = useAuth()
  const [sc] = useState(() => pickCostRandom(COST_SCENARIOS))
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const [phase, setPhase] = useState<Phase>('try')
  const [sliderQ, setSliderQ] = useState(5)
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(COSTS_L4_QUIZ, 3))
  const [accuracyPoints, setAccuracyPoints] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const MARKET_PRICE = sc.marketPrice
  const OPTIMAL_Q = sc.optimalQ

  const computeScenarioProfit = (Q: number, price: number): number => {
    if (Q === 0) return -sc.FC
    const tc = sc.schedule[Q].TC
    return price * Q - tc
  }

  const currentRow = sc.schedule[sliderQ]
  const currentMC = currentRow.MC

  const handleSubmit = () => setPhase('quiz')

  const finishQuiz = (correctCount: number) => {
    setTimerRunning(false)
    const remaining = secondsRemainingRef.current
    const diff = Math.abs(sliderQ - OPTIMAL_Q)
    const ap = diff === 0 ? 200 : diff === 1 ? 80 : 0
    const tb = remaining > TOTAL_SECONDS * 0.75 ? 100 : remaining > TOTAL_SECONDS * 0.5 ? 50 : 0
    const qp = correctCount * 100
    const total = ap + tb + qp
    setAccuracyPoints(ap)
    setTimeBonusState(tb)
    setQuizPoints(qp)
    setTotalScore(total)
    if (session) {
      submitScore({
        user_id: session.user.id, user_email: session.user.email ?? '',
        level: 12, score: total, accuracy_points: ap, time_bonus: tb,
        quiz_points: qp, time_taken_seconds: TOTAL_SECONDS - remaining, scenario_id: sc.id + '-l4',
      }).then(() => setLeaderboardKey(k => k + 1))
    }
    setPhase('reveal')
  }

  const handleTimerExpire = () => {
    setTimerRunning(false)
    if (phase === 'try') setPhase('quiz')
    else finishQuiz(0)
  }

  const profitRows = [5,6,7,8,9,10].map(q => ({
    Q: q,
    TR: MARKET_PRICE * q,
    TC: sc.schedule[q].TC,
    profit: computeScenarioProfit(q, MARKET_PRICE),
  }))

  const shutdownPrice = Math.round(sc.minAVC)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-0.5">
              <Link to="/dashboard" className="hover:text-indigo-600">← Dashboard</Link>
              <span>›</span>
              <Link to="/games/costs" className="hover:text-indigo-600">{t('Vállalati költségek', 'Firm Costs')}</Link>
              <span>›</span>
              <span className="text-slate-700 font-semibold">4. {t('Profitmaximalizálás', 'Profit Max')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {t(`P = ${MARKET_PRICE} Ft — hány ${sc.productHu}?`, `P = ${MARKET_PRICE} Ft — how many ${sc.productEn}s?`)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {phase !== 'reveal' && (
              <GameTimer totalSeconds={TOTAL_SECONDS} running={timerRunning}
                onExpire={handleTimerExpire} onTick={r => { secondsRemainingRef.current = r }} />
            )}
            <div className="flex items-center gap-1">
              {[1,2,3,4].map(n => (
                <Link key={n} to={`/games/costs/level/${n}`}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${n === 4 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300'}`}>
                  {n}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        <NotationBox notations={[
          { symbol: 'TC', full: 'Teljes költség (Total Cost)', formula: 'TC = FC + VC', altSymbols: 'TK, összköltség' },
          { symbol: 'FC', full: 'Fix költség (Fixed Cost)', altSymbols: 'FK, állandó költség', note: 'nem függ a termelési mennyiségtől' },
          { symbol: 'VC', full: 'Változó költség (Variable Cost)', altSymbols: 'VK', note: 'arányosan változik Q-val' },
          { symbol: 'MC', full: 'Határköltség (Marginal Cost)', formula: 'MC = ΔTC / ΔQ', altSymbols: 'MK, határköltség' },
          { symbol: 'AC', full: 'Átlagos összköltség (Average Total Cost)', formula: 'AC = TC / Q', altSymbols: 'ATC, átlagköltség' },
          { symbol: 'AVC', full: 'Átlagos változó költség (Avg. Variable Cost)', formula: 'AVC = VC / Q' },
          { symbol: 'AFC', full: 'Átlagos fix költség (Avg. Fixed Cost)', formula: 'AFC = FC / Q' },
          { symbol: 'π', full: 'Profit', formula: 'π = TR − TC', altSymbols: 'nyereség' },
          { symbol: 'Q', full: 'Termelési mennyiség (Output Quantity)' },
        ]} />
        {phase === 'try' && (
          <>
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-6">
              <div className="text-2xl mb-2">{sc.icon}</div>
              <h2 className="font-bold text-slate-900 mb-1">{t('Versenypiac: ár-elfogadó vagy', 'Competitive market: you are a price-taker')}</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t(
                  `A piaci ár P = ${MARKET_PRICE} Ft. Ha ennél többet kérsz, senki sem vesz tőled. Ha kevesebbet, veszítesz. Döntsd el: hány ${sc.productHu} legyen?`,
                  `The market price is P = ${MARKET_PRICE} Ft. If you charge more, nobody buys. If you charge less, you lose money. Decide: how many ${sc.productEn}s to produce?`
                )}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-700">Q = {sliderQ} {t(sc.productHu, sc.productEn)}</span>
                <div className="text-right">
                  <span className="text-xs text-slate-400">{t('MC ennél az egységnél:', 'MC at this unit:')}</span>
                  <span className={`ml-2 font-bold text-sm ${currentMC !== null && currentMC < MARKET_PRICE ? 'text-emerald-600' : 'text-red-600'}`}>
                    {currentMC !== null ? `${currentMC} Ft` : '—'}
                  </span>
                  {currentMC !== null && (
                    <span className={`ml-2 text-xs font-medium ${currentMC < MARKET_PRICE ? 'text-emerald-600' : 'text-red-600'}`}>
                      {currentMC < MARKET_PRICE ? `< P=${MARKET_PRICE} ✓` : `> P=${MARKET_PRICE} ✗`}
                    </span>
                  )}
                </div>
              </div>
              <input type="range" min={0} max={10} value={sliderQ}
                onChange={e => setSliderQ(Number(e.target.value))}
                className="w-full accent-violet-600 mb-4" />
              <CostsChart mode="profit" highlightQ={sliderQ} marketPrice={MARKET_PRICE}
                schedule={sc.schedule} qMinMC={sc.qMinMC} />
            </div>

            <button onClick={handleSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-colors">
              {t(`Beküldöm: Q = ${sliderQ} →`, `Submit: Q = ${sliderQ} →`)}
            </button>
          </>
        )}

        {phase === 'quiz' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">🧠</span>
              <h2 className="font-bold text-slate-900">{t('Gyors kérdések', 'Quick Questions')}</h2>
            </div>
            <QuizPanel questions={quizQuestions as any} onComplete={finishQuiz} />
          </div>
        )}

        {phase === 'reveal' && (
          <>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6">
              <div className="text-3xl font-extrabold text-emerald-700 mb-1">+{totalScore} {t('pont', 'pts')}</div>
              <div className="text-sm text-slate-500 space-y-0.5">
                <div>{t('Q* pontosság:', 'Q* accuracy:')} +{accuracyPoints} {sliderQ !== OPTIMAL_Q && `(${t('te:', 'you:')} Q=${sliderQ}, ${t('optimum:', 'optimum:')} Q=${OPTIMAL_Q})`}</div>
                <div>{t('Kérdések:', 'Quiz:')} +{quizPoints}</div>
                <div>{t('Sebességi bónusz:', 'Speed bonus:')} +{timeBonus}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">{t(`Profittábla (P = ${MARKET_PRICE} Ft)`, `Profit table (P = ${MARKET_PRICE} Ft)`)}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2 text-slate-500">Q</th>
                    <th className="text-right py-2 text-violet-600">TR</th>
                    <th className="text-right py-2 text-slate-600">TC</th>
                    <th className="text-right py-2 text-emerald-600">{t('Profit', 'Profit')}</th>
                  </tr>
                </thead>
                <tbody>
                  {profitRows.map(r => (
                    <tr key={r.Q} className={`border-b border-slate-100 ${r.Q === OPTIMAL_Q ? 'bg-emerald-50 font-bold' : ''}`}>
                      <td className="py-2 font-mono text-slate-700">{r.Q} {r.Q === OPTIMAL_Q && '← Q*'}</td>
                      <td className="text-right py-2 font-mono text-violet-700">{r.TR}</td>
                      <td className="text-right py-2 font-mono text-slate-700">{r.TC}</td>
                      <td className={`text-right py-2 font-mono font-bold ${r.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {r.profit >= 0 ? '+' : ''}{r.profit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">{t('Profitmaximalizálás', 'Profit maximization')}</h3>
              <CostsChart mode="profit" highlightQ={OPTIMAL_Q} marketPrice={MARKET_PRICE}
                schedule={sc.schedule} qMinMC={sc.qMinMC} showReveal />
            </div>

            <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
              <div className="font-bold text-red-800 mb-2">🚨 {t(`Bónusz szcenárió: Mi van, ha P = ${shutdownPrice} Ft?`, `Bonus scenario: What if P = ${shutdownPrice} Ft?`)}</div>
              <div className="text-sm text-red-700 space-y-1">
                <p>{t(`Min AVC = ${sc.minAVC} Ft. Ha P = ${shutdownPrice} < ${sc.minAVC} = min AVC:`, `Min AVC = ${sc.minAVC} Ft. If P = ${shutdownPrice} < ${sc.minAVC} = min AVC:`)}</p>
                <p className="font-bold">→ {t('Állítsd le a termelést! (Q = 0)', 'Shut down production! (Q = 0)')}</p>
                <p>{t(`Veszteség leálláskor = FC = ${sc.FC} Ft — ez kisebb, mint bármely termelési szinten`, `Loss from shutting down = FC = ${sc.FC} Ft — less than at any production level`)}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">{t('Leállási döntések', 'Shutdown decisions')}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2 text-slate-500">P</th>
                    <th className="text-right py-2 text-slate-600">Q*</th>
                    <th className="text-right py-2 text-emerald-600">{t('Profit', 'Profit')}</th>
                    <th className="text-right py-2 text-slate-500">{t('Döntés', 'Decision')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 bg-emerald-50">
                    <td className="py-2 font-mono">{MARKET_PRICE}</td>
                    <td className="text-right py-2 font-mono">{OPTIMAL_Q}</td>
                    <td className="text-right py-2 font-mono font-bold text-emerald-600">+{computeScenarioProfit(OPTIMAL_Q, MARKET_PRICE)}</td>
                    <td className="text-right py-2 text-xs text-emerald-700 font-medium">{t('Termelj', 'Produce')}</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-amber-50">
                    <td className="py-2 font-mono">{sc.qMinATC ? Math.round(sc.minATC) : sc.minATC}</td>
                    <td className="text-right py-2 font-mono">{sc.qMinATC}</td>
                    <td className="text-right py-2 font-mono font-bold text-amber-600">{computeScenarioProfit(sc.qMinATC, Math.round(sc.minATC))}</td>
                    <td className="text-right py-2 text-xs text-amber-700 font-medium">{t('Termelj (P>AVC)', 'Produce (P>AVC)')}</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-red-50">
                    <td className="py-2 font-mono">{shutdownPrice}</td>
                    <td className="text-right py-2 font-mono">0</td>
                    <td className="text-right py-2 font-mono font-bold text-red-600">−{sc.FC}</td>
                    <td className="text-right py-2 text-xs text-red-700 font-medium">{t('Leállás! (P<AVC)', 'Shut down! (P<AVC)')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">{t('Verseny vs. Monopólium', 'Competition vs. Monopoly')}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2 text-slate-500">{t('Piacforma', 'Market type')}</th>
                    <th className="text-right py-2 text-slate-600">{t('Feltétel', 'Condition')}</th>
                    <th className="text-right py-2 text-slate-600">Q*</th>
                    <th className="text-right py-2 text-slate-600">P*</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-700">{t('Verseny (ez a szint)', 'Competition (this level)')}</td>
                    <td className="text-right py-2 font-mono text-slate-600">P = MC</td>
                    <td className="text-right py-2 font-mono font-bold text-emerald-700">{OPTIMAL_Q}</td>
                    <td className="text-right py-2 font-mono">{MARKET_PRICE}</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="py-2 text-slate-700">{t('Monopólium (L1 játék)', 'Monopoly (L1 game)')}</td>
                    <td className="text-right py-2 font-mono text-slate-600">MR = MC</td>
                    <td className="text-right py-2 font-mono font-bold text-red-600">{t('kevesebb', 'less')}</td>
                    <td className="text-right py-2 font-mono text-red-600">{t('magasabb', 'higher')}</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-slate-400 mt-2">{t('Monopóliumban MR < P, ezért MR=MC → kisebb Q, magasabb P, DWL', 'In monopoly MR < P, so MR=MC → lower Q, higher P, DWL')}</p>
            </div>

            <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
              <div className="font-bold text-indigo-900 mb-1">💡 {t('Tanulság', 'Key Takeaway')}</div>
              <p className="text-indigo-800 text-sm leading-relaxed">
                {t(
                  'A versenypiaci cég addig termel, amíg az utolsó egység ára fedezi annak határköltségét (P=MC). Ha az ár az AVC alá esik, nincs értelme termelni — a bezárás olcsóbb. A fix ktg "elmerült": már megfizetted, nem befolyásolhatja a döntésedet.',
                  'A competitive firm produces until the price of the last unit covers its marginal cost (P=MC). If price falls below AVC, producing is not worth it — shutting down is cheaper. Fixed cost is "sunk": already paid, it cannot influence your decision.'
                )}
              </p>
              <div className="mt-3 text-sm text-indigo-700">
                🏭 {t(
                  'Valós példa: Egy acélgyár válságban: ha az acélár fedezi az anyag- és energiaköltséget (AVC), de nem a teljes átlagot (ATC), az üzem ideiglenesen termel tovább — míg a bérleti szerződés meg nem újul.',
                  'Real example: A steel plant in crisis: if the steel price covers material and energy costs (AVC) but not full average cost (ATC), the plant keeps running temporarily — until the lease expires.'
                )}
              </div>
            </div>

                        {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('4. szint (Ktg)', 'Level 4 (Costs)')}</h2>
              <Leaderboard level={12} refreshKey={leaderboardKey} />
            </div>

            <div className="flex gap-3">
              <Link to="/games/costs/level/3" className="flex-1 text-center py-3 rounded-xl border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 font-medium transition-colors text-sm">
                ← {t('3. szint', 'Level 3')}
              </Link>
              <Link to="/dashboard" className="flex-1 text-center py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
                {t('Összes játék →', 'All games →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
