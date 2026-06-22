import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { XED_SCENARIO } from '../../engine/elasticity-scenarios'
import { ELASTICITY_LEVEL3_QUIZ, pickQuestions } from '../../engine/elasticity-quiz'
import { submitScore, calcTimeBonus } from '../../lib/scores'
import ElasticityChart from './charts/ElasticityChart'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import Leaderboard from '../Leaderboard'
import NotationBox from '../NotationBox'

type Phase = 'try' | 'quiz' | 'reveal'
type XEDType = 'substitute' | 'complement' | 'independent'

const TOTAL_SECONDS = 120

export default function ElasticityLevel3() {
  const { t } = useI18n()
  const { session } = useAuth()

  const scenario = XED_SCENARIO
  const [phase, setPhase] = useState<Phase>('try')
  const [classifications, setClassifications] = useState<Record<string, XEDType>>({})
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(ELASTICITY_LEVEL3_QUIZ, 3))
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  const [accuracyPoints, setAccuracyPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const classifiedCount = Object.keys(classifications).length
  const allClassified = classifiedCount === scenario.pairs.length

  const handleClassify = (id: string, value: XEDType) => {
    setClassifications(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = () => {
    setPhase('quiz')
  }

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

  const finishQuiz = (correctCount: number) => {
    setTimerRunning(false)

    let correct = 0
    for (const pair of scenario.pairs) {
      if (classifications[pair.id] === pair.type) correct++
    }

    const ap = Math.round((correct / scenario.pairs.length) * 500)
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
        level: 23,
        score: total,
        accuracy_points: ap,
        time_bonus: tb,
        quiz_points: qp,
        time_taken_seconds: TOTAL_SECONDS - secondsRemainingRef.current,
        scenario_id: scenario.id,
      }).then(() => setLeaderboardKey(k => k + 1))
    }

    setPhase('reveal')
  }

  const typeLabel = (type: XEDType) => {
    switch (type) {
      case 'substitute': return t('Helyettesítő', 'Substitute')
      case 'complement': return t('Komplementer', 'Complement')
      case 'independent': return t('Független', 'Independent')
    }
  }

  const typeColor = (type: XEDType) => {
    switch (type) {
      case 'substitute': return 'bg-blue-100 text-blue-700'
      case 'complement': return 'bg-green-100 text-green-700'
      case 'independent': return 'bg-slate-100 text-slate-700'
    }
  }

  const typeButtonActive = (type: XEDType, sel: XEDType | undefined) =>
    sel === type ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-0.5">
              <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">← Dashboard</Link>
              <span>›</span>
              <Link to="/games/elasticity" className="hover:text-indigo-600 transition-colors">{t('Rugalmasság', 'Elasticity')}</Link>
              <span>›</span>
              <span className="text-slate-700 font-semibold">3. {t('Kereszt-árrugalmasság', 'Cross-Price Elasticity')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{t('XED — Helyettesítők és komplementerek', 'XED — Substitutes and complements')}</h1>
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
              {[1, 2, 3, 4].map(n => (
                <Link key={n} to={`/games/elasticity/level/${n}`}
                  className={`w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${n === 3 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                  {n}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <NotationBox notations={[
          { symbol: 'XED', full: 'Kereszt-árrugalmasság (Cross-Price Elasticity of Demand)', formula: 'XED = ΔQb% / ΔPa%', altSymbols: 'Exy, Eab, keresztrugalmasság' },
          { symbol: 'XED > 0', full: 'Helyettesítő termékek (Substitutes)', note: 'pl. Pepsi és Coca-Cola' },
          { symbol: 'XED < 0', full: 'Komplementer termékek (Complements)', note: 'pl. autó és benzin' },
          { symbol: 'XED = 0', full: 'Független termékek (Unrelated goods)' },
        ]} />

        {/* TRY PHASE */}
        {phase === 'try' && (
          <>
            {/* Context card */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border border-green-100 p-6">
              <div className="flex gap-3">
                <span className="text-3xl">🔗</span>
                <div>
                  <h2 className="font-bold text-slate-900">{t('Szituáció', 'Situation')}</h2>
                  <p className="text-slate-700 text-sm mt-1 leading-relaxed">{t(scenario.contextHu, scenario.contextEn)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs bg-white border border-green-200 text-green-700 px-2 py-1 rounded-lg font-semibold">XED = ΔQ(B)% / ΔP(A)%</span>
                    <span className="text-xs bg-white border border-green-200 text-green-700 px-2 py-1 rounded-lg font-semibold">{t('XED>0: helyettesítő', 'XED>0: substitute')}</span>
                    <span className="text-xs bg-white border border-green-200 text-green-700 px-2 py-1 rounded-lg font-semibold">{t('XED<0: komplementer', 'XED<0: complement')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800">{t('Sorold be a párokat:', 'Classify the pairs:')}</h2>
              <span className="text-sm text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                {classifiedCount}/{scenario.pairs.length} {t('besorolva', 'classified')}
              </span>
            </div>

            {/* Pairs grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {scenario.pairs.map(pair => {
                const sel = classifications[pair.id]
                return (
                  <div key={pair.id} className={`bg-white rounded-2xl border-2 p-4 transition-all ${sel ? 'border-indigo-300 shadow-md' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl">{pair.emojiA}</span>
                      <span className="font-semibold text-slate-900 text-sm">{t(pair.huNameA, pair.enNameA)}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-2xl">{pair.emojiB}</span>
                      <span className="font-semibold text-slate-900 text-sm">{t(pair.huNameB, pair.enNameB)}</span>
                    </div>
                    <p className="text-xs text-slate-500 text-center mb-3">
                      {t(`A ${pair.huNameA} ára +${pair.deltaPA}%-ot változott → a ${pair.huNameB} kereslete...?`,
                         `${pair.enNameA} price changed +${pair.deltaPA}% → ${pair.enNameB} demand...?`)}
                    </p>
                    <div className="flex gap-1">
                      {(['substitute', 'complement', 'independent'] as XEDType[]).map(type => (
                        <button
                          key={type}
                          onClick={() => handleClassify(pair.id, type)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${typeButtonActive(type, sel)}`}
                        >
                          {type === 'substitute' ? t('Helyettesítő', 'Substitute') + ' 🔄' :
                           type === 'complement' ? t('Komplementer', 'Complement') + ' 🤝' :
                           t('Független', 'Independent') + ' ⬜'}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!allClassified}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-lg shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {allClassified ? t('Beküldöm! →', 'Submit! →') : `${t('Besorolj még', 'Classify')} ${scenario.pairs.length - classifiedCount} ${t('párt', 'more pairs')}`}
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
                <p className="text-xs text-slate-500">{t('Az óra még fut. Helyes válasz = +100 pont.', 'Timer is still running. Correct answer = +100 pts.')}</p>
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
            </div>

            {/* Results table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm overflow-x-auto">
              <h2 className="font-bold text-slate-800 mb-4">{t('Eredmények', 'Results')}</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                    <th className="pb-2">{t('Pár', 'Pair')}</th>
                    <th className="pb-2">ΔP(A)%</th>
                    <th className="pb-2">ΔQ(B)%</th>
                    <th className="pb-2">XED</th>
                    <th className="pb-2">{t('Típus', 'Type')}</th>
                    <th className="pb-2">{t('Helyes?', 'Correct?')}</th>
                  </tr>
                </thead>
                <tbody>
                  {scenario.pairs.map(pair => {
                    const correct = classifications[pair.id] === pair.type
                    return (
                      <tr key={pair.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-2 font-medium text-xs">
                          {pair.emojiA} {t(pair.huNameA, pair.enNameA)} → {pair.emojiB} {t(pair.huNameB, pair.enNameB)}
                        </td>
                        <td className="py-2 text-slate-600">+{pair.deltaPA}%</td>
                        <td className="py-2 text-slate-600">{pair.deltaQB}%</td>
                        <td className="py-2 font-mono font-bold text-indigo-700">{pair.xed}</td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${typeColor(pair.type)}`}>
                            {typeLabel(pair.type)}
                          </span>
                        </td>
                        <td className="py-2 text-lg">{correct ? '✅' : '❌'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">{t('Kereslet eltolódása — helyettesítő hatás', 'Demand shift — substitute effect')}</h2>
              <ElasticityChart type="xed_shift" direction="right" />
            </div>

            {/* Tanulság */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-black text-amber-900 text-lg mb-4">💡 {t('Tanulság', 'Key takeaway')}</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-xl p-4 border border-amber-100">
                  <h4 className="font-bold text-slate-900 mb-1">{t('XED értelmezése', 'Interpreting XED')}</h4>
                  <p className="text-slate-700">{t('Ha XED > 0: a termékek helyettesítők — B ára nő → fogyasztók átváltanak A-ra. Ha XED < 0: komplementerek — B ára nő → B és A kereslete is csökken. Ha XED ≈ 0: független piacok.', 'If XED > 0: products are substitutes — B price rises → consumers switch to A. If XED < 0: complements — B price rises → demand for both B and A falls. If XED ≈ 0: independent markets.')}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-amber-100">
                  <h4 className="font-bold text-slate-900 mb-1">{t('Üzleti alkalmazás', 'Business application')}</h4>
                  <p className="text-slate-700">{t('Az Apple olcsón árulja az AirPodst, mert az iPhone-nal komplementer. A konzolgyártók néha veszteséggel adják a hardvert, mert a játékszoftverek eladásán keresnek. Ismerd meg a párodat!', 'Apple sells AirPods cheaply because they complement iPhone. Console makers sometimes sell hardware at a loss because they earn on game software. Know your complement!')}</p>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('Toplista — 3. szint (XED)', 'Leaderboard — Level 3 (XED)')}</h2>
              <Leaderboard level={23} refreshKey={leaderboardKey} />
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Link to="/games/elasticity/level/2"
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm text-center">
                {t('← Level 2', '← Level 2')}
              </Link>
              <Link to="/games/elasticity/level/4"
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md">
                {t('Level 4 →', 'Level 4 →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
