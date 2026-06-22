import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { submitScore } from '../../lib/scores'
import { COST_SCENARIOS, pickCostRandom } from '../../engine/costs-scenarios'
import { COSTS_L2_QUIZ, pickQuestions } from '../../engine/costs-quiz'
import CostsChart from './charts/CostsChart'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import NotationBox from '../NotationBox'
import Leaderboard from '../Leaderboard'

type Phase = 'try' | 'quiz' | 'reveal'
const TOTAL_SECONDS = 300

export default function Level2() {
  const { t } = useI18n()
  const { session } = useAuth()
  const [sc] = useState(() => pickCostRandom(COST_SCENARIOS))
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const [phase, setPhase] = useState<Phase>('try')
  const [mcInputs, setMcInputs] = useState<Record<number, string>>(
    Object.fromEntries([1,2,3,4,5,6,7,8,9,10].map(q => [q, '']))
  )
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(COSTS_L2_QUIZ, 3))
  const [mcPoints, setMcPoints] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const allFilled = [1,2,3,4,5,6,7,8,9,10].every(q => mcInputs[q] !== '')

  const handleSubmit = () => setPhase('quiz')

  const finishQuiz = (correctCount: number) => {
    setTimerRunning(false)
    const remaining = secondsRemainingRef.current
    let mp = 0
    for (let q = 1; q <= 10; q++) {
      const correct = sc.schedule[q].MC!
      const user = parseFloat(mcInputs[q])
      if (!isNaN(user) && Math.abs(user - correct) / correct <= 0.05) mp += 20
    }
    const tb = remaining > TOTAL_SECONDS * 0.75 ? 100 : remaining > TOTAL_SECONDS * 0.5 ? 50 : 0
    const qp = correctCount * 100
    const total = mp + tb + qp
    setMcPoints(mp)
    setTimeBonusState(tb)
    setQuizPoints(qp)
    setTotalScore(total)
    if (session) {
      submitScore({
        user_id: session.user.id, user_email: session.user.email ?? '',
        level: 10, score: total, accuracy_points: mp, time_bonus: tb,
        quiz_points: qp, time_taken_seconds: TOTAL_SECONDS - remaining, scenario_id: sc.id + '-l2',
      }).then(() => setLeaderboardKey(k => k + 1))
    }
    setPhase('reveal')
  }

  const handleTimerExpire = () => {
    setTimerRunning(false)
    if (phase === 'try') setPhase('quiz')
    else finishQuiz(0)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-0.5">
              <Link to="/dashboard" className="hover:text-indigo-600">← Dashboard</Link>
              <span>›</span>
              <Link to="/games/costs" className="hover:text-indigo-600">{t('Vállalati költségek', 'Firm Costs')}</Link>
              <span>›</span>
              <span className="text-slate-700 font-semibold">2. {t('Határköltség', 'Marginal Cost')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {t(`Mennyibe kerül az egyik extra ${sc.productHu}?`, `What does one extra ${sc.productEn} cost?`)}
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
                  className={`w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${n === 2 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300'}`}>
                  {n}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

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
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100 p-6">
              <div className="text-2xl mb-2">{sc.icon}</div>
              <h2 className="font-bold text-slate-900 mb-1">{t(sc.titleHu, sc.titleEn)}</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t(
                  'Megvan a TC táblázat. Most számítsd ki az MC-t (határköltség = ΔTC/ΔQ) minden egységhez!',
                  'You have the TC schedule. Now compute MC (marginal cost = ΔTC/ΔQ) for each unit!'
                )}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2 text-slate-500">Q</th>
                    <th className="text-right py-2 text-slate-700">TC (Ft)</th>
                    <th className="text-right py-2 text-red-600">MC = ΔTC (Ft)</th>
                  </tr>
                </thead>
                <tbody>
                  {sc.schedule.map(row => (
                    <tr key={row.Q} className="border-b border-slate-100">
                      <td className="py-2 font-mono text-slate-700">{row.Q}</td>
                      <td className="text-right py-2 font-mono font-bold text-slate-800">{row.TC}</td>
                      <td className="text-right py-2">
                        {row.Q === 0 ? (
                          <span className="text-slate-300 font-mono">—</span>
                        ) : (
                          <input
                            type="number"
                            value={mcInputs[row.Q]}
                            onChange={e => setMcInputs(prev => ({ ...prev, [row.Q]: e.target.value }))}
                            className="w-20 text-right border border-slate-200 rounded-lg px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-300"
                            placeholder="?"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={handleSubmit} disabled={!allFilled}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl transition-colors">
              {t('Beküldöm →', 'Submit →')}
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
                <div>{t('MC számítás:', 'MC calculations:')} +{mcPoints}</div>
                <div>{t('Kérdések:', 'Quiz:')} +{quizPoints}</div>
                <div>{t('Sebességi bónusz:', 'Speed bonus:')} +{timeBonus}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">{t('Megoldás — TC és MC tábla', 'Solution — TC and MC table')}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2 text-slate-500">Q</th>
                    <th className="text-right py-2 text-slate-700">TC</th>
                    <th className="text-right py-2 text-red-600">MC</th>
                    <th className="text-right py-2 text-slate-400">Te</th>
                    <th className="text-right py-2 text-slate-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {sc.schedule.map(row => {
                    const isMinMC = row.Q === sc.qMinMC
                    const userVal = row.Q > 0 ? parseFloat(mcInputs[row.Q]) : NaN
                    const correct = row.MC
                    const close = !isNaN(userVal) && correct !== null && Math.abs(userVal - correct) / correct <= 0.05
                    return (
                      <tr key={row.Q} className={`border-b border-slate-100 ${isMinMC ? 'bg-red-50' : ''}`}>
                        <td className="py-2 font-mono text-slate-700">{row.Q}</td>
                        <td className="text-right py-2 font-mono text-slate-800">{row.TC}</td>
                        <td className={`text-right py-2 font-mono font-bold ${isMinMC ? 'text-red-600' : 'text-slate-700'}`}>
                          {row.MC ?? '—'} {isMinMC && '← min'}
                        </td>
                        <td className="text-right py-2 font-mono text-slate-400">{row.Q > 0 ? (isNaN(userVal) ? '?' : userVal) : '—'}</td>
                        <td className="text-right py-2">{row.Q > 0 && (close ? '✓' : '✗')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className="text-xs text-red-600 mt-2 font-medium">
                {t(`Min MC = ${sc.minMC} Ft, Q = ${sc.qMinMC}-nél`, `Min MC = ${sc.minMC} Ft at Q = ${sc.qMinMC}`)}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">{t('MC görbe', 'MC curve')}</h3>
              <CostsChart mode="mc" schedule={sc.schedule} qMinMC={sc.qMinMC} />
            </div>

            <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
              <div className="font-bold text-indigo-900 mb-1">💡 {t('Tanulság', 'Key Takeaway')}</div>
              <p className="text-indigo-800 text-sm leading-relaxed">
                {t(
                  'A határköltség nem ugyanaz, mint az átlagköltség. A min MC jóval kisebb, mint az ATC. A döntést az MC befolyásolja: érdemes-e még egy egységet termelni?',
                  'Marginal cost is not the same as average cost. The min MC is much lower than ATC. MC drives the decision: is it worth producing one more unit?'
                )}
              </p>
              <div className="mt-3 text-sm text-indigo-700">
                ✈️ {t(
                  'Valós példa: Egy repülőn az utolsó üres hely MC-je közel nulla (alig több üzemanyag). Ezért adnak last-minute olcsó jegyet — amíg MC < ár, megéri.',
                  'Real example: The last empty seat on a plane has near-zero MC (barely more fuel). That\'s why last-minute cheap tickets exist — as long as MC < price, it\'s worth selling.'
                )}
              </div>
            </div>

                        {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('2. szint (Ktg)', 'Level 2 (Costs)')}</h2>
              <Leaderboard level={10} refreshKey={leaderboardKey} />
            </div>

            <div className="flex gap-3">
              <Link to="/games/costs/level/1" className="flex-1 text-center py-3 rounded-xl border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 font-medium transition-colors text-sm">
                ← {t('1. szint', 'Level 1')}
              </Link>
              <Link to="/games/costs/level/3" className="flex-1 text-center py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
                {t('3. szint →', 'Level 3 →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
