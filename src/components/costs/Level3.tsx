import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { submitScore } from '../../lib/scores'
import { COST_SCENARIOS, pickCostRandom } from '../../engine/costs-scenarios'
import { COSTS_L3_QUIZ, pickQuestions } from '../../engine/costs-quiz'
import CostsChart from './charts/CostsChart'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import NotationBox from '../NotationBox'
import Leaderboard from '../Leaderboard'

type Phase = 'try' | 'quiz' | 'reveal'
const TOTAL_SECONDS = 300

export default function Level3() {
  const { t } = useI18n()
  const { session } = useAuth()
  const [sc] = useState(() => pickCostRandom(COST_SCENARIOS))
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const [phase, setPhase] = useState<Phase>('try')
  const [guessMinATC, setGuessMinATC] = useState('')
  const [guessMinAVC, setGuessMinAVC] = useState('')
  const [guessMCxATC, setGuessMCxATC] = useState('')
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(COSTS_L3_QUIZ, 3))
  const [guessPoints, setGuessPoints] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const canSubmit = guessMinATC !== '' && guessMinAVC !== ''

  const handleSubmit = () => setPhase('quiz')

  const finishQuiz = (correctCount: number) => {
    setTimerRunning(false)
    const remaining = secondsRemainingRef.current
    const atcQ = parseInt(guessMinATC)
    const avcQ = parseInt(guessMinAVC)
    let gp = 0
    if (atcQ === sc.qMinATC) gp += 100
    else if (Math.abs(atcQ - sc.qMinATC) === 1) gp += 50
    if (avcQ === sc.qMinAVC) gp += 100
    else if (Math.abs(avcQ - sc.qMinAVC) === 1) gp += 50

    const tb = remaining > TOTAL_SECONDS * 0.75 ? 100 : remaining > TOTAL_SECONDS * 0.5 ? 50 : 0
    const qp = correctCount * 100
    const total = gp + tb + qp
    setGuessPoints(gp)
    setTimeBonusState(tb)
    setQuizPoints(qp)
    setTotalScore(total)
    if (session) {
      submitScore({
        user_id: session.user.id, user_email: session.user.email ?? '',
        level: 11, score: total, accuracy_points: gp, time_bonus: tb,
        quiz_points: qp, time_taken_seconds: TOTAL_SECONDS - remaining, scenario_id: sc.id + '-l3',
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
              <span className="text-slate-700 font-semibold">3. {t('Átlagköltségek', 'Average Costs')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {t(`Hol a leghatékonyabb a(z) ${sc.icon}?`, `Where is the ${sc.icon} most efficient?`)}
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
                  className={`w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${n === 3 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300'}`}>
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
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6">
              <div className="text-2xl mb-2">📐</div>
              <h2 className="font-bold text-slate-900 mb-1">{t('A hatékony méret', 'The efficient scale')}</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-3">
                {t('"A hatékonyság titka a jó méret."', '"The secret of efficiency is the right scale."')}
              </p>
              <div className="bg-white/70 rounded-xl p-3 text-sm space-y-2">
                <p className="text-slate-700">
                  🎭 <span className="font-semibold">{t('Szereped:', 'Your role:')}</span>{' '}
                  {t(`Te vagy a(z) ${sc.icon} vállalkozás felbérelt stratégiai tanácsadója. A tulajdonos egyetlen kérdéssel vár: „Mekkora üzemméret az ideális?"`, `You are the hired strategy consultant of the ${sc.icon} business. The owner greets you with a single question: "What is the ideal scale of operation?"`)}
                </p>
                <p className="text-slate-700">
                  🎯 <span className="font-semibold">{t('Feladatod:', 'Your task:')}</span>{' '}
                  {t('Olvasd le a görbékről, és írd be: melyik Q-nál a legalacsonyabb az ATC, és melyiknél az AVC!', 'Read the curves and enter: at which Q is ATC lowest, and at which Q is AVC lowest!')}
                </p>
                <p className="text-slate-700">
                  ⚠️ <span className="font-semibold">{t('A tét:', 'The stakes:')}</span>{' '}
                  {t('A tulajdonos a te számod alapján bővít vagy zsugorít. Rossz méret → drágán termel, a versenytársak alá áraznak, és a cég kiszorul a piacról.', 'The owner will expand or shrink based on your number. Wrong scale → costly production, competitors undercut you, and the firm is pushed out of the market.')}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">{t('Átlagköltség görbék', 'Average cost curves')}</h3>
              <CostsChart mode="averages" schedule={sc.schedule} qMinAVC={sc.qMinAVC} qMinATC={sc.qMinATC} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="font-semibold text-slate-900">{t('Megjóslom:', 'My predictions:')}</h3>
              <div className="flex items-center gap-3">
                <label className="text-sm text-indigo-700 font-medium whitespace-nowrap w-48">
                  {t('Min ATC-t hozó Q =', 'Q with min ATC =')}
                </label>
                <input type="number" min={1} max={10} value={guessMinATC}
                  onChange={e => setGuessMinATC(e.target.value)}
                  className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="?" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-emerald-700 font-medium whitespace-nowrap w-48">
                  {t('Min AVC-t hozó Q =', 'Q with min AVC =')}
                </label>
                <input type="number" min={1} max={10} value={guessMinAVC}
                  onChange={e => setGuessMinAVC(e.target.value)}
                  className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="?" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-500 whitespace-nowrap w-48">
                  {t('MC metszi ATC-t Q =', 'MC crosses ATC at Q =')} <span className="text-xs">(opcionális)</span>
                </label>
                <input type="number" min={1} max={10} value={guessMCxATC}
                  onChange={e => setGuessMCxATC(e.target.value)}
                  className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="?" />
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
                <div>{t('Becslés:', 'Estimates:')} +{guessPoints}</div>
                <div>{t('Kérdések:', 'Quiz:')} +{quizPoints}</div>
                <div>{t('Sebességi bónusz:', 'Speed bonus:')} +{timeBonus}</div>
              </div>
              {(() => {
                const frac = guessPoints / 200
                const medal = frac >= 0.9 ? '🥇' : frac >= 0.6 ? '🥈' : frac >= 0.3 ? '🥉' : '💪'
                const medalLabel = frac >= 0.9 ? t('Arany fokozat', 'Gold medal') : frac >= 0.6 ? t('Ezüst fokozat', 'Silver medal') : frac >= 0.3 ? t('Bronz fokozat', 'Bronze medal') : t('Gyakorolj még!', 'Keep practicing!')
                const perfect = parseInt(guessMinATC) === sc.qMinATC && parseInt(guessMinAVC) === sc.qMinAVC
                return (
                  <div className="mt-3 pt-3 border-t border-emerald-200 space-y-1">
                    <div className="text-sm font-bold text-slate-700">{medal} {medalLabel}</div>
                    {perfect ? (
                      <div className="text-sm font-medium text-emerald-700">
                        🏆 {t('Mindkét minimumot eltaláltad — a tanácsod alapján a cég pontosan a hatékony méretre áll be!', 'You nailed both minima — following your advice, the firm settles at exactly the efficient scale!')}
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-red-600">
                        💸 {t(`A hatékony méretet elvétetted (ATC-minimum: Q=${sc.qMinATC}, AVC-minimum: Q=${sc.qMinAVC}) — rossz méretű üzemmel a cég évekig felesleges költséget cipelne.`, `You missed the efficient scale (min ATC at Q=${sc.qMinATC}, min AVC at Q=${sc.qMinAVC}) — at the wrong scale, the firm would carry needless costs for years.`)}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">{t('Teljes költségtábla', 'Full cost table')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      {['Q','TC','MC','ATC','AVC','AFC'].map(h => (
                        <th key={h} className={`py-2 px-1 text-right first:text-left font-medium ${h==='ATC'?'text-indigo-600':h==='AVC'?'text-emerald-600':h==='MC'?'text-red-500':'text-slate-500'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sc.schedule.map(row => {
                      const isMinATC = row.Q === sc.qMinATC
                      const isMinAVC = row.Q === sc.qMinAVC
                      return (
                        <tr key={row.Q} className={`border-b border-slate-100 ${isMinATC ? 'bg-indigo-50' : isMinAVC ? 'bg-emerald-50' : ''}`}>
                          <td className="py-1.5 px-1 font-mono text-slate-700">{row.Q}</td>
                          <td className="text-right px-1 py-1.5 font-mono text-slate-800">{row.TC}</td>
                          <td className={`text-right px-1 py-1.5 font-mono ${row.Q===sc.qMinMC?'text-red-600 font-bold':''}`}>{row.MC ?? '—'}</td>
                          <td className={`text-right px-1 py-1.5 font-mono font-bold ${isMinATC?'text-indigo-700':''}`}>{row.ATC ?? '—'}{isMinATC?' ★':''}</td>
                          <td className={`text-right px-1 py-1.5 font-mono font-bold ${isMinAVC?'text-emerald-700':''}`}>{row.AVC ?? '—'}{isMinAVC?' ★':''}</td>
                          <td className="text-right px-1 py-1.5 font-mono text-slate-400">{row.AFC ?? '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                <div className="text-xs text-emerald-600 font-bold mb-1">{t('Leállási küszöb', 'Shutdown point')}</div>
                <div className="text-lg font-bold text-emerald-800">P = {sc.minAVC} Ft</div>
                <div className="text-xs text-emerald-600">(Q={sc.qMinAVC}, min AVC)</div>
                <div className="text-xs text-slate-500 mt-1">{t(`Ha P < ${sc.minAVC} → leállj!`, `If P < ${sc.minAVC} → shut down!`)}</div>
              </div>
              <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
                <div className="text-xs text-indigo-600 font-bold mb-1">{t('Nyereségküszöb', 'Break-even price')}</div>
                <div className="text-lg font-bold text-indigo-800">P = {sc.minATC} Ft</div>
                <div className="text-xs text-indigo-600">(Q={sc.qMinATC}, min ATC)</div>
                <div className="text-xs text-slate-500 mt-1">{t(`Ha P < ${sc.minATC} → hosszú távon veszteséges`, `If P < ${sc.minATC} → long-run loss`)}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">{t('Átlagköltség görbék', 'Average cost curves')}</h3>
              <CostsChart mode="averages" showReveal schedule={sc.schedule} qMinAVC={sc.qMinAVC} qMinATC={sc.qMinATC} qMinMC={sc.qMinMC} />
            </div>

            <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
              <div className="font-bold text-indigo-900 mb-1">💡 {t('Tanulság', 'Key Takeaway')}</div>
              <p className="text-indigo-800 text-sm leading-relaxed">
                {t(
                  'Az ATC U-alakú, mert két erő verseng: az AFC lefelé húzza, de az AVC előbb-utóbb felfelé tolja. Az MC görbék metszéspontjai nem véletlen — ha az extra egység olcsóbb az átlagnál, az átlag csökken; ha drágább, nő.',
                  'ATC is U-shaped because two forces compete: AFC pulls it down, but AVC eventually pulls it up. The MC crossing points are not coincidence — if the extra unit is cheaper than the average, the average falls; if it is costlier, average rises.'
                )}
              </p>
              <div className="mt-3 text-sm text-indigo-700">
                ☕ {t(
                  'Valós példa: Egy kis kávézó 5 asztallal veszteséges (magas AFC), 15 asztallal optimális, 30 asztallal ismét veszteséges (torlódás → AVC nő).',
                  'Real example: A small café with 5 tables loses money (high AFC), with 15 tables it\'s optimal, with 30 tables it loses again (congestion → AVC rises).'
                )}
              </div>
            </div>

                        {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('3. szint (Ktg)', 'Level 3 (Costs)')}</h2>
              <Leaderboard level={11} refreshKey={leaderboardKey} />
            </div>

            <div className="flex gap-3">
              <Link to="/games/costs/level/2" className="flex-1 text-center py-3 rounded-xl border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 font-medium transition-colors text-sm">
                ← {t('2. szint', 'Level 2')}
              </Link>
              <Link to="/games/costs/level/4" className="flex-1 text-center py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
                {t('4. szint →', 'Level 4 →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
