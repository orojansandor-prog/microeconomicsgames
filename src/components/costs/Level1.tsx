import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { submitScore } from '../../lib/scores'
import { COST_SCENARIOS, pickCostRandom } from '../../engine/costs-scenarios'
import { COSTS_L1_QUIZ, pickQuestions } from '../../engine/costs-quiz'
import CostsChart from './charts/CostsChart'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import NotationBox from '../NotationBox'
import Leaderboard from '../Leaderboard'

type Phase = 'try' | 'quiz' | 'reveal'

const TOTAL_SECONDS = 300

export default function Level1() {
  const { t } = useI18n()
  const { session } = useAuth()
  const [sc] = useState(() => pickCostRandom(COST_SCENARIOS))
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const [phase, setPhase] = useState<Phase>('try')
  const [assignments, setAssignments] = useState<Record<string, 'fix' | 'valtozo' | null>>(
    () => Object.fromEntries(sc.costItems.map(c => [c.id, null]))
  )
  const [sliderQ, setSliderQ] = useState(5)
  const [tcEstimate, setTcEstimate] = useState('')
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(COSTS_L1_QUIZ, 3))
  const [catPoints, setCatPoints] = useState(0)
  const [tcPoints, setTcPoints] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const allAssigned = Object.values(assignments).every(v => v !== null)
  const tcVal = parseFloat(tcEstimate)
  const canSubmit = allAssigned && !isNaN(tcVal)

  const handleAssign = (id: string, type: 'fix' | 'valtozo') => {
    setAssignments(prev => ({ ...prev, [id]: type }))
  }

  const handleSubmit = () => {
    setPhase('quiz')
  }

  const finishQuiz = (correctCount: number) => {
    setTimerRunning(false)
    const remaining = secondsRemainingRef.current

    // Categorization points
    const cp = sc.costItems.reduce((sum, item) => {
      return sum + (assignments[item.id] === item.correct ? 20 : 0)
    }, 0)

    // TC estimate points
    const correctTC = sc.schedule[sliderQ].TC
    const err = Math.abs(tcVal - correctTC) / correctTC
    const tp = err <= 0.05 ? 200 : err <= 0.15 ? 80 : 0

    const tb = remaining > TOTAL_SECONDS * 0.75 ? 100 : remaining > TOTAL_SECONDS * 0.5 ? 50 : 0
    const qp = correctCount * 100
    const total = cp + tp + tb + qp

    setCatPoints(cp)
    setTcPoints(tp)
    setTimeBonusState(tb)
    setQuizPoints(qp)
    setTotalScore(total)

    if (session) {
      submitScore({
        user_id: session.user.id,
        user_email: session.user.email ?? '',
        level: 9,
        score: total,
        accuracy_points: cp + tp,
        time_bonus: tb,
        quiz_points: qp,
        time_taken_seconds: TOTAL_SECONDS - remaining,
        scenario_id: sc.id,
      }).then(() => setLeaderboardKey(k => k + 1))
    }
    setPhase('reveal')
  }

  const handleTimerExpire = () => {
    setTimerRunning(false)
    if (phase === 'try') setPhase('quiz')
    else if (phase === 'quiz') finishQuiz(0)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-0.5">
              <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">← Dashboard</Link>
              <span>›</span>
              <Link to="/games/costs" className="hover:text-indigo-600 transition-colors">
                {t('Vállalati költségek', 'Firm Costs')}
              </Link>
              <span>›</span>
              <span className="text-slate-700 font-semibold">1. {t('Fix vs. változó', 'Fixed vs. Variable')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {t('Melyik költség marad, ha nem termel?', 'Which cost stays even when output is zero?')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {phase !== 'reveal' && (
              <GameTimer totalSeconds={TOTAL_SECONDS} running={timerRunning}
                onExpire={handleTimerExpire} onTick={r => { secondsRemainingRef.current = r }} />
            )}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map(n => (
                <Link key={n} to={`/games/costs/level/${n}`}
                  className={`w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${n === 1 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
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
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6">
              <div className="text-2xl mb-2">{sc.icon}</div>
              <h2 className="font-bold text-slate-900 mb-1">{t(sc.titleHu, sc.titleEn)}</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {t(sc.storyHu, sc.storyEn)}{' '}
                {t(
                  'Kategorizáld a költségeket — fix (nem függ Q-tól) vagy változó (Q-val nő)?',
                  'Categorize each cost — fixed (does not depend on Q) or variable (rises with Q)?'
                )}
              </p>
              <div className="bg-white/70 rounded-xl p-3 text-sm">
                <div className="font-semibold text-slate-700 mb-2">📊 {t('Ismert adatok (Ft/nap):', 'Known data (Ft/day):')}</div>
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-amber-200">
                      <th className="text-left py-1 text-slate-500 font-medium">Q ({t(sc.productHu, sc.productEn)})</th>
                      <th className="text-right py-1 text-orange-600 font-medium">FC</th>
                      <th className="text-right py-1 text-blue-600 font-medium">VC</th>
                      <th className="text-right py-1 text-slate-700 font-medium">TC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sc.hintAnchorRows.map((q, idx) => {
                      const row = sc.schedule[q]
                      return (
                        <tr key={q} className={idx < sc.hintAnchorRows.length - 1 ? 'border-b border-amber-100' : ''}>
                          <td className="py-1 text-slate-700">{q}</td>
                          <td className="text-right py-1 text-orange-600">{row.FC}</td>
                          <td className="text-right py-1 text-blue-600">{row.VC}</td>
                          <td className="text-right py-1 text-slate-800 font-bold">{row.TC}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <p className="text-xs text-slate-400 mt-2 italic">
                  {t('A közbülső értékeket te becsüld!', 'Estimate the values in between!')}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">{t('Kategorizáld a költségeket:', 'Categorize each cost:')}</h3>
              <div className="space-y-3">
                {sc.costItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-sm font-medium text-slate-800">{t(item.hu, item.en)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAssign(item.id, 'fix')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${assignments[item.id] === 'fix' ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-600'}`}>
                        {t('Fix', 'Fixed')}
                      </button>
                      <button
                        onClick={() => handleAssign(item.id, 'valtozo')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${assignments[item.id] === 'valtozo' ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'}`}>
                        {t('Változó', 'Variable')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">
                {t('TC becslés:', 'TC estimate:')} Q = {sliderQ} {t(sc.productHu, sc.productEn)}
              </h3>
              <input type="range" min={0} max={10} value={sliderQ}
                onChange={e => setSliderQ(Number(e.target.value))}
                className="w-full accent-indigo-600 mb-4" />
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600 whitespace-nowrap">
                  {t('Szerinted TC =', 'Your TC estimate =')}
                </label>
                <input type="number" value={tcEstimate} onChange={e => setTcEstimate(e.target.value)}
                  placeholder="pl. 265"
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                <span className="text-sm text-slate-400">Ft</span>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={!canSubmit}
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
                <div>{t('Kategorizálás:', 'Categorization:')} +{catPoints}</div>
                <div>{t('TC becslés:', 'TC estimate:')} +{tcPoints}</div>
                <div>{t('Kérdések:', 'Quiz:')} +{quizPoints}</div>
                <div>{t('Sebességi bónusz:', 'Speed bonus:')} +{timeBonus}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">{t('Helyes kategorizálás:', 'Correct categorization:')}</h3>
              <div className="space-y-2">
                {sc.costItems.map(item => {
                  const userAns = assignments[item.id]
                  const correct = userAns === item.correct
                  return (
                    <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border ${correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                      <span className="text-sm font-medium text-slate-800">{t(item.hu, item.en)}</span>
                      <span className={`text-xs font-bold ${correct ? 'text-emerald-700' : 'text-red-600'}`}>
                        {correct ? '✓' : '✗'} {item.correct === 'fix' ? t('Fix', 'Fixed') : t('Változó', 'Variable')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">{t('TC táblázat', 'TC Table')}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-slate-500 font-medium">Q</th>
                    <th className="text-right py-2 text-orange-600 font-medium">FC</th>
                    <th className="text-right py-2 text-blue-600 font-medium">VC</th>
                    <th className="text-right py-2 text-slate-700 font-medium">TC</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 3, 6, 9].map(q => {
                    const row = sc.schedule[q]
                    return (
                      <tr key={q} className="border-b border-slate-100">
                        <td className="py-2 font-mono text-slate-700">{q}</td>
                        <td className="text-right py-2 text-orange-600 font-mono">{row.FC}</td>
                        <td className="text-right py-2 text-blue-600 font-mono">{row.VC}</td>
                        <td className="text-right py-2 text-slate-800 font-bold font-mono">{row.TC}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">{t('TC, FC, VC görbék', 'TC, FC, VC curves')}</h3>
              <CostsChart mode="tc" schedule={sc.schedule} />
            </div>

            <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
              <div className="font-bold text-indigo-900 mb-1">💡 {t('Tanulság', 'Key Takeaway')}</div>
              <p className="text-indigo-800 text-sm leading-relaxed">
                {t(
                  'A fix költség nem tűnik el attól, hogy keveset termelsz — de minél több egységre osztod szét, annál kisebb az egy egységre eső AFC. A változó ktg viszont alkalmazkodik: nulla termék = nulla változó ktg.',
                  'Fixed cost does not disappear when you produce less — but the more units you spread it over, the smaller the AFC per unit. Variable cost adapts: zero output = zero variable cost.'
                )}
              </p>
              <div className="mt-3 text-sm text-indigo-700">
                🏪 {t(
                  'Valós példa: Egy étterem bérleti díja ugyanannyi, ha 10 vendéget fogad, mint ha 100-at. Ezért lényeges a kapacitáskihasználás.',
                  'Real example: A restaurant pays the same rent whether it serves 10 or 100 guests. This is why capacity utilization matters.'
                )}
              </div>
            </div>

                        {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('1. szint (Ktg)', 'Level 1 (Costs)')}</h2>
              <Leaderboard level={9} refreshKey={leaderboardKey} />
            </div>

            <div className="flex gap-3">
              <Link to="/games/costs" className="flex-1 text-center py-3 rounded-xl border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 font-medium transition-colors text-sm">
                {t('← Szintek', '← Levels')}
              </Link>
              <Link to="/games/costs/level/2" className="flex-1 text-center py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
                {t('2. szint →', 'Level 2 →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
