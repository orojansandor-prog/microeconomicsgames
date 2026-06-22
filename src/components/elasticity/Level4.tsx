import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { YED_SCENARIO } from '../../engine/elasticity-scenarios'
import { ELASTICITY_LEVEL4_QUIZ, pickQuestions } from '../../engine/elasticity-quiz'
import { submitScore, calcTimeBonus } from '../../lib/scores'
import ElasticityChart from './charts/ElasticityChart'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import Leaderboard from '../Leaderboard'
import NotationBox from '../NotationBox'

type Phase = 'try' | 'quiz' | 'reveal'
type DemandPrediction = 'up' | 'down' | 'same'

const TOTAL_SECONDS = 120

export default function ElasticityLevel4() {
  const { t } = useI18n()
  const { session } = useAuth()

  const scenario = YED_SCENARIO
  const [phase, setPhase] = useState<Phase>('try')
  const [predictions, setPredictions] = useState<Record<string, DemandPrediction>>({})
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(ELASTICITY_LEVEL4_QUIZ, 3))
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  const [accuracyPoints, setAccuracyPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const predictedCount = Object.keys(predictions).length
  const allPredicted = predictedCount === scenario.products.length

  const handlePredict = (id: string, value: DemandPrediction) => {
    setPredictions(prev => ({ ...prev, [id]: value }))
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

  const getTruePrediction = (deltaQ_pct: number): DemandPrediction => {
    if (deltaQ_pct > 0.5) return 'up'
    if (deltaQ_pct < -0.5) return 'down'
    return 'same'
  }

  const finishQuiz = (correctCount: number) => {
    setTimerRunning(false)

    let correct = 0
    for (const product of scenario.products) {
      const truePred = getTruePrediction(product.deltaQ_pct)
      if (predictions[product.id] === truePred) correct++
    }

    const ap = Math.round((correct / scenario.products.length) * 500)
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
        level: 24,
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

  const yedTypeLabel = (type: string) => {
    switch (type) {
      case 'luxury': return t('Luxus', 'Luxury')
      case 'normal': return t('Normál', 'Normal')
      case 'inferior': return t('Inferior', 'Inferior')
      default: return type
    }
  }

  const yedTypeColor = (type: string) => {
    switch (type) {
      case 'luxury': return 'bg-violet-100 text-violet-700'
      case 'normal': return 'bg-blue-100 text-blue-700'
      case 'inferior': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const predictionButtonActive = (val: DemandPrediction, sel: DemandPrediction | undefined) =>
    sel === val ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'

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
              <span className="text-slate-700 font-semibold">4. {t('Jövedelemrugalmasság', 'Income Elasticity')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{t('YED — Normál, inferior vagy luxus?', 'YED — Normal, inferior or luxury?')}</h1>
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
                  className={`w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${n === 4 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                  {n}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <NotationBox notations={[
          { symbol: 'YED', full: 'Jövedelemrugalmasság (Income Elasticity of Demand)', formula: 'YED = ΔQd% / ΔY%', altSymbols: 'Ey, EI, jövedelemrugalmasság' },
          { symbol: 'ΔY%', full: 'Jövedelem százalékos változása', altSymbols: 'ΔI%, Δm%' },
          { symbol: 'YED > 1', full: 'Luxusjószág (Luxury good)', note: 'kereslet gyorsabban nő a jövedelemnél' },
          { symbol: '0 < YED < 1', full: 'Normál jószág (Normal good)', note: 'kereslet nő, de lassabban' },
          { symbol: 'YED < 0', full: 'Inferior jószág (Inferior good)', note: 'kereslet csökken, ha jövedelem nő — pl. margarin' },
        ]} />

        {/* TRY PHASE */}
        {phase === 'try' && (
          <>
            {/* Context card */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100 p-6">
              <div className="flex gap-3">
                <span className="text-3xl">💰</span>
                <div>
                  <h2 className="font-bold text-slate-900">{t('Szituáció', 'Situation')}</h2>
                  <p className="text-slate-700 text-sm mt-1 leading-relaxed">{t(scenario.contextHu, scenario.contextEn)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs bg-white border border-violet-200 text-violet-700 px-2 py-1 rounded-lg font-semibold">YED = ΔQ% / ΔY%</span>
                    <span className="text-xs bg-white border border-violet-200 text-violet-700 px-2 py-1 rounded-lg font-semibold">ΔY = +{scenario.deltaY_pct}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800">{t('Jósold meg a kereslet irányát:', 'Predict the direction of demand:')}</h2>
              <span className="text-sm text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                {predictedCount}/{scenario.products.length} {t('besorolva', 'classified')}
              </span>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {scenario.products.map(product => {
                const sel = predictions[product.id]
                return (
                  <div key={product.id} className={`bg-white rounded-2xl border-2 p-4 transition-all ${sel ? 'border-indigo-300 shadow-md' : 'border-slate-200'}`}>
                    <div className="text-4xl text-center mb-2">{product.emoji}</div>
                    <div className="font-semibold text-slate-900 text-center text-xs mb-3 leading-tight">{t(product.huName, product.enName)}</div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handlePredict(product.id, 'up')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${predictionButtonActive('up', sel)}`}
                      >
                        {t('Nő', 'Rises')} ↑
                      </button>
                      <button
                        onClick={() => handlePredict(product.id, 'down')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${predictionButtonActive('down', sel)}`}
                      >
                        {t('Csökken', 'Falls')} ↓
                      </button>
                      <button
                        onClick={() => handlePredict(product.id, 'same')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${predictionButtonActive('same', sel)}`}
                      >
                        {t('Nem változik', 'No change')} →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!allPredicted}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-lg shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {allPredicted ? t('Beküldöm! →', 'Submit! →') : `${t('Besorolj még', 'Classify')} ${scenario.products.length - predictedCount} ${t('terméket', 'more products')}`}
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
                    <th className="pb-2">{t('Termék', 'Product')}</th>
                    <th className="pb-2">{t('Jóslatod', 'Your prediction')}</th>
                    <th className="pb-2">{t('Valós ΔQ%', 'True ΔQ%')}</th>
                    <th className="pb-2">YED</th>
                    <th className="pb-2">{t('Típus', 'Type')}</th>
                    <th className="pb-2">{t('Helyes?', 'Correct?')}</th>
                  </tr>
                </thead>
                <tbody>
                  {scenario.products.map(product => {
                    const truePred = getTruePrediction(product.deltaQ_pct)
                    const userPred = predictions[product.id]
                    const correct = userPred === truePred
                    const predLabel = (p: DemandPrediction) => p === 'up' ? '↑ ' + t('Nő', 'Rises') : p === 'down' ? '↓ ' + t('Csökken', 'Falls') : '→ ' + t('Nem változik', 'Same')
                    return (
                      <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-2 font-medium text-xs">{product.emoji} {t(product.huName, product.enName)}</td>
                        <td className="py-2 text-slate-600 text-xs">{userPred ? predLabel(userPred) : '–'}</td>
                        <td className="py-2 font-mono">
                          <span className={product.deltaQ_pct > 0 ? 'text-green-600' : product.deltaQ_pct < 0 ? 'text-red-600' : 'text-slate-600'}>
                            {product.deltaQ_pct > 0 ? '+' : ''}{product.deltaQ_pct}%
                          </span>
                        </td>
                        <td className="py-2 font-mono font-bold text-indigo-700">{product.yed}</td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${yedTypeColor(product.type)}`}>
                            {yedTypeLabel(product.type)}
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
              <h2 className="font-bold text-slate-800 mb-4">{t('YED értékek — jövedelemrugalmasság', 'YED values — income elasticity')}</h2>
              <ElasticityChart type="yed" products={scenario.products} />
            </div>

            {/* Tanulság */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-black text-amber-900 text-lg mb-4">💡 {t('Tanulság', 'Key takeaway')}</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-xl p-4 border border-amber-100">
                  <h4 className="font-bold text-slate-900 mb-1">{t('A három kategória', 'The three categories')}</h4>
                  <p className="text-slate-700">{t('Luxuscikkeknél (YED>1) a kereslet a jövedelemnél gyorsabban nő. Normál jószágoknál (0<YED<1) a kereslet nő, de lassabban. Inferior jószágoknál (YED<0) a kereslet csökken — gazdagodáskor jobb alternatívára váltanak.', 'For luxury goods (YED>1) demand grows faster than income. For normal goods (0<YED<1) demand rises but slower. For inferior goods (YED<0) demand falls — people switch to better alternatives when they get richer.')}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-amber-100">
                  <h4 className="font-bold text-slate-900 mb-1">{t('Üzleti alkalmazás', 'Business application')}</h4>
                  <p className="text-slate-700">{t('A luxusipar (Hermès, 1. osztályú repülő) robbanásszerűen nő, ha az átlagjövedelem emelkedik. Az instant tészta és a buszbérlet iparága ezzel szemben összezsugorodik. A gazdasági ciklus hatása iparáganként nagyon eltérő.', 'The luxury industry (Hermès, first-class flights) booms when average income rises. Instant noodle and bus pass industries shrink. The effect of economic cycles varies greatly by industry.')}</p>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('Toplista — 4. szint (YED)', 'Leaderboard — Level 4 (YED)')}</h2>
              <Leaderboard level={24} refreshKey={leaderboardKey} />
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Link to="/games/elasticity/level/3"
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm text-center">
                {t('← Level 3', '← Level 3')}
              </Link>
              <Link to="/dashboard"
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md">
                {t('Vissza a játékokhoz ✓', 'Back to games ✓')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
