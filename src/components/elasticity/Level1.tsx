import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { classifyPED } from '../../engine/elasticity'
import { PED_SCENARIOS, pickRandom } from '../../engine/elasticity-scenarios'
import { ELASTICITY_LEVEL1_QUIZ, pickQuestions } from '../../engine/elasticity-quiz'
import { submitScore, calcTimeBonus } from '../../lib/scores'
import ElasticityChart from './charts/ElasticityChart'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import Leaderboard from '../Leaderboard'
import NotationBox from '../NotationBox'

type Phase = 'try' | 'quiz' | 'reveal'

const TOTAL_SECONDS = 120

export default function ElasticityLevel1() {
  const { t } = useI18n()
  const { session } = useAuth()

  const [scenario] = useState(() => pickRandom(PED_SCENARIOS))
  const [phase, setPhase] = useState<Phase>('try')
  const [classifications, setClassifications] = useState<Record<string, 'elastic' | 'inelastic'>>({})
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(ELASTICITY_LEVEL1_QUIZ, 3))
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  const [accuracyPoints, setAccuracyPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const classifiedCount = Object.keys(classifications).length
  const allClassified = classifiedCount === scenario.products.length

  const handleClassify = (id: string, value: 'elastic' | 'inelastic') => {
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
    for (const product of scenario.products) {
      const userClass = classifications[product.id]
      const trueClass = classifyPED(product.ped)
      const trueSimple = trueClass === 'elastic' ? 'elastic' : 'inelastic'
      if (userClass === trueSimple) correct++
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
        level: 21,
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
              <span className="text-slate-700 font-semibold">1. {t('Kereslet árrugalmassága', 'Price Elasticity of Demand')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{t('PED — Rugalmas vagy rugalmatlan?', 'PED — Elastic or inelastic?')}</h1>
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
          { symbol: 'PED', full: 'Kereslet árrugalmassága (Price Elasticity of Demand)', formula: 'PED = ΔQd% / ΔP%', altSymbols: 'Ed, εd, η (eta), Ep' },
          { symbol: 'ΔQd%', full: 'Keresett mennyiség százalékos változása', formula: 'ΔQ / Q × 100' },
          { symbol: 'ΔP%', full: 'Ár százalékos változása', formula: 'ΔP / P × 100' },
          { symbol: '|PED| < 1', full: 'Rugalmatlan kereslet (Inelastic)', note: 'pl. alapélelmiszer, gyógyszer' },
          { symbol: '|PED| > 1', full: 'Rugalmas kereslet (Elastic)', note: 'pl. luxuscikk, könnyen helyettesíthető' },
          { symbol: '|PED| = 1', full: 'Egységrugalmas (Unit elastic)', note: 'TR maximuma' },
        ]} />

        {/* TRY PHASE */}
        {phase === 'try' && (
          <>
            {/* Context card */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-6">
              <div className="flex gap-3 mb-1">
                <span className="text-3xl">📐</span>
                <div>
                  <h2 className="font-bold text-slate-900">{t('Szituáció', 'Situation')}</h2>
                  <p className="text-slate-700 text-sm mt-1 leading-relaxed">{t(scenario.contextHu, scenario.contextEn)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">{t('ΔP = +10% minden terméknél', 'ΔP = +10% for each product')}</span>
                <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">PED = ΔQ% / ΔP%</span>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800">{t('Sorold be a termékeket:', 'Classify the products:')}</h2>
              <span className="text-sm text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                {classifiedCount}/{scenario.products.length} {t('besorolva', 'classified')}
              </span>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {scenario.products.map(product => {
                const sel = classifications[product.id]
                return (
                  <div key={product.id} className={`bg-white rounded-2xl border-2 p-4 transition-all ${sel ? 'border-indigo-300 shadow-md' : 'border-slate-200'}`}>
                    <div className="text-4xl text-center mb-2">{product.emoji}</div>
                    <div className="font-semibold text-slate-900 text-center text-sm mb-1">{t(product.huName, product.enName)}</div>
                    <div className="text-xs text-center text-slate-400 mb-3 bg-slate-50 rounded-lg py-1">
                      {t('Az ár 10%-ot nőtt', 'Price rose 10%')}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleClassify(product.id, 'elastic')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${sel === 'elastic' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {t('Rugalmas', 'Elastic')} 📈
                      </button>
                      <button
                        onClick={() => handleClassify(product.id, 'inelastic')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${sel === 'inelastic' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {t('Rugalmatlan', 'Inelastic')} 📉
                      </button>
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
              {allClassified ? t('Beküldöm! →', 'Submit! →') : `${t('Besorolj még', 'Classify')} ${scenario.products.length - classifiedCount} ${t('terméket', 'more products')}`}
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
                    <th className="pb-2">ΔP%</th>
                    <th className="pb-2">ΔQ%</th>
                    <th className="pb-2">PED</th>
                    <th className="pb-2">{t('Típus', 'Type')}</th>
                    <th className="pb-2">{t('Bevétel', 'Revenue')}</th>
                    <th className="pb-2">{t('Helyes?', 'Correct?')}</th>
                  </tr>
                </thead>
                <tbody>
                  {scenario.products.map(product => {
                    const pedAbs = Math.abs(product.ped)
                    const isElastic = pedAbs > 1
                    const trueSimple: 'elastic' | 'inelastic' = isElastic ? 'elastic' : 'inelastic'
                    const userClass = classifications[product.id]
                    const correct = userClass === trueSimple
                    return (
                      <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-2 font-medium">{product.emoji} {t(product.huName, product.enName)}</td>
                        <td className="py-2 text-slate-600">+{product.deltaP_pct}%</td>
                        <td className="py-2 text-slate-600">{product.deltaQ_pct}%</td>
                        <td className="py-2 font-mono font-bold text-indigo-700">{product.ped}</td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isElastic ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {isElastic ? t('Rugalmas', 'Elastic') : t('Rugalmatlan', 'Inelastic')}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${product.trDirection === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {product.trDirection === 'up' ? '↑ TR' : '↓ TR'}
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
              <h2 className="font-bold text-slate-800 mb-4">{t('PED értékek — |PED| nagyság szerint', 'PED values — by |PED| magnitude')}</h2>
              <ElasticityChart type="ped" products={scenario.products} />
            </div>

            {/* Tanulság */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-black text-amber-900 text-lg mb-4">💡 {t('Tanulság', 'Key takeaway')}</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-xl p-4 border border-amber-100">
                  <h4 className="font-bold text-slate-900 mb-1">{t('Bevételi hatás', 'Revenue effect')}</h4>
                  <p className="text-slate-700">{t('Rugalmas keresletnél (|PED|>1) az áremelés csökkenti a bevételt, mert a kereslet erősen visszaesik. Rugalmatlan keresletnél (|PED|<1) az áremelés növeli a bevételt.', 'With elastic demand (|PED|>1) a price rise reduces revenue because demand falls sharply. With inelastic demand (|PED|<1) a price rise increases revenue.')}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-amber-100">
                  <h4 className="font-bold text-slate-900 mb-1">{t('Miért különböznek?', 'Why do they differ?')}</h4>
                  <p className="text-slate-700">{t('Az életmentő gyógyszereknek (inzulin) kevés helyettesítőjük van, így az ár nem befolyásolja a keresletet. A luxustermékeknek (iPhone, Starbucks) sok alternatívájuk van.', 'Life-saving drugs (insulin) have few substitutes, so price barely affects demand. Luxury products (iPhone, Starbucks) have many alternatives.')}</p>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('Toplista — 1. szint (PED)', 'Leaderboard — Level 1 (PED)')}</h2>
              <Leaderboard level={21} refreshKey={leaderboardKey} />
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => { setPhase('try'); setClassifications({}); setTimerRunning(true); secondsRemainingRef.current = TOTAL_SECONDS }}
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm"
              >
                {t('← Újra', '← Try again')}
              </button>
              <Link to="/games/elasticity/level/2"
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md">
                {t('Level 2 →', 'Level 2 →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
