import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { classifyPES } from '../../engine/elasticity'
import { PES_SCENARIO } from '../../engine/elasticity-scenarios'
import { ELASTICITY_LEVEL2_QUIZ, pickQuestions } from '../../engine/elasticity-quiz'
import { submitScore, calcTimeBonus } from '../../lib/scores'
import ElasticityChart from './charts/ElasticityChart'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import Leaderboard from '../Leaderboard'
import NotationBox from '../NotationBox'

type Phase = 'try' | 'quiz' | 'reveal'

const TOTAL_SECONDS = 150

export default function ElasticityLevel2() {
  const { t } = useI18n()
  const { session } = useAuth()

  const scenario = PES_SCENARIO
  const [phase, setPhase] = useState<Phase>('try')
  const [shortEstimates, setShortEstimates] = useState<(number | null)[]>(
    new Array(scenario.industries.length).fill(null)
  )
  const [longEstimates, setLongEstimates] = useState<(number | null)[]>(
    new Array(scenario.industries.length).fill(null)
  )
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(ELASTICITY_LEVEL2_QUIZ, 3))
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  const [accuracyPoints, setAccuracyPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const allFilled = shortEstimates.every(v => v !== null) && longEstimates.every(v => v !== null)

  const handleShortChange = (i: number, v: number) => {
    setShortEstimates(prev => { const next = [...prev]; next[i] = v; return next })
  }

  const handleLongChange = (i: number, v: number) => {
    setLongEstimates(prev => { const next = [...prev]; next[i] = v; return next })
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

    let ap = 0
    for (let i = 0; i < scenario.industries.length; i++) {
      const ind = scenario.industries[i]
      const shortEst = shortEstimates[i] ?? 0
      const longEst = longEstimates[i] ?? 0
      ap += Math.max(0, 1 - Math.abs(shortEst - ind.shortRunPES) / Math.max(ind.shortRunPES, 0.01)) * 50
      ap += Math.max(0, 1 - Math.abs(longEst - ind.longRunPES) / Math.max(ind.longRunPES, 0.01)) * 50
    }
    ap = Math.round(ap)

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
        level: 22,
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

  const pesTypeLabel = (pes: number) => {
    const cls = classifyPES(pes)
    switch (cls) {
      case 'elastic': return t('Rugalmas', 'Elastic')
      case 'inelastic': return t('Rugalmatlan', 'Inelastic')
      case 'perfectly_inelastic': return t('Tökéletesen rugalmatlan', 'Perfectly inelastic')
      case 'perfectly_elastic': return t('Tökéletesen rugalmas', 'Perfectly elastic')
    }
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
              <span className="text-slate-700 font-semibold">2. {t('Kínálat rugalmassága', 'Price Elasticity of Supply')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{t('PES — Rövid vs. hosszú táv', 'PES — Short vs. long run')}</h1>
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
                  className={`w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${n === 2 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                  {n}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <NotationBox notations={[
          { symbol: 'PES', full: 'Kínálat árrugalmassága (Price Elasticity of Supply)', formula: 'PES = ΔQs% / ΔP%', altSymbols: 'Es, εs, Esp' },
          { symbol: 'ΔQs%', full: 'Kínált mennyiség százalékos változása' },
          { symbol: 'ΔP%', full: 'Ár százalékos változása' },
          { symbol: 'PES = 0', full: 'Tökéletesen rugalmatlan kínálat', note: 'pl. koncertterem — fix kapacitás' },
          { symbol: 'PES → ∞', full: 'Tökéletesen rugalmas kínálat', note: 'vízszintes kínálati görbe' },
        ]} />

        {/* TRY PHASE */}
        {phase === 'try' && (
          <>
            {/* Context card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 space-y-3">
              {/* Kínálati oldal jelzés */}
              <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold w-fit">
                <span>🏭</span>
                <span>{t('KÍNÁLATI OLDAL — te most termelő/szolgáltató vagy, nem vevő!', 'SUPPLY SIDE — you are a producer/supplier, not a buyer!')}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-3xl">📦</span>
                <div>
                  <h2 className="font-bold text-slate-900">{t('Szituáció', 'Situation')}</h2>
                  <p className="text-slate-700 text-sm mt-1 leading-relaxed">
                    {t(
                      'Az árak 20%-ot emelkedtek. Termelőként/szolgáltatóként: mennyivel tudod növelni a kínált mennyiséget? A kérdés NEM az, hogy a vevők mennyit vesznek — hanem hogy TE mennyit tudsz szállítani.',
                      'Prices rose 20%. As a producer/supplier: by how much can you increase the quantity supplied? The question is NOT how much buyers will buy — but how much YOU can supply.',
                    )}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-semibold">PES = ΔQs% / ΔP%</span>
                    <span className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-semibold">{t('PES=0: fix kapacitás', 'PES=0: fixed capacity')}</span>
                    <span className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-semibold">{t('PES=1: egységrugalmas', 'PES=1: unit elastic')}</span>
                    <span className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-semibold">{t('PES=5+: nagyon rugalmas (hosszú táv)', 'PES=5+: very elastic (long run)')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Industry sliders */}
            <div className="space-y-4">
              {scenario.industries.map((ind, i) => (
                <div key={ind.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{ind.emoji}</span>
                    <div>
                      <div className="font-bold text-slate-900">{t(ind.huName, ind.enName)}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-600">{t('Rövid táv PES becslésem:', 'My short-run PES estimate:')}</label>
                        <span className="font-black text-blue-600 text-lg">{shortEstimates[i]?.toFixed(1) ?? '–'}</span>
                      </div>
                      <input
                        type="range" min={0} max={15} step={0.1}
                        value={shortEstimates[i] ?? 0}
                        onChange={e => handleShortChange(i, Number(e.target.value))}
                        onMouseDown={() => { if (shortEstimates[i] === null) handleShortChange(i, 0) }}
                        onTouchStart={() => { if (shortEstimates[i] === null) handleShortChange(i, 0) }}
                        onClick={() => { if (shortEstimates[i] === null) handleShortChange(i, 0) }}
                        className="w-full h-3 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>0 ({t('rugalmatlan', 'inelastic')})</span>
                        <span>15 ({t('rugalmas', 'elastic')})</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-600">{t('Hosszú táv PES becslésem:', 'My long-run PES estimate:')}</label>
                        <span className="font-black text-green-600 text-lg">{longEstimates[i]?.toFixed(1) ?? '–'}</span>
                      </div>
                      <input
                        type="range" min={0} max={15} step={0.1}
                        value={longEstimates[i] ?? 0}
                        onChange={e => handleLongChange(i, Number(e.target.value))}
                        onMouseDown={() => { if (longEstimates[i] === null) handleLongChange(i, 0) }}
                        onTouchStart={() => { if (longEstimates[i] === null) handleLongChange(i, 0) }}
                        onClick={() => { if (longEstimates[i] === null) handleLongChange(i, 0) }}
                        className="w-full h-3 bg-green-100 rounded-full appearance-none cursor-pointer accent-green-600"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>0 ({t('rugalmatlan', 'inelastic')})</span>
                        <span>15 ({t('rugalmas', 'elastic')})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!allFilled}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-lg shadow-md hover:shadow-lg disabled:cursor-not-allowed"
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
                    <th className="pb-2">{t('Iparág', 'Industry')}</th>
                    <th className="pb-2">{t('Rövid becslés', 'Short est.')}</th>
                    <th className="pb-2">{t('Rövid valós', 'Short true')}</th>
                    <th className="pb-2">{t('Hosszú becslés', 'Long est.')}</th>
                    <th className="pb-2">{t('Hosszú valós', 'Long true')}</th>
                    <th className="pb-2">{t('Típus', 'Type')}</th>
                  </tr>
                </thead>
                <tbody>
                  {scenario.industries.map((ind, i) => (
                    <tr key={ind.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 font-medium">{ind.emoji} {t(ind.huName, ind.enName)}</td>
                      <td className="py-2 text-blue-600 font-mono">{shortEstimates[i]?.toFixed(1) ?? '–'}</td>
                      <td className="py-2 font-mono font-bold text-indigo-700">{ind.shortRunPES}</td>
                      <td className="py-2 text-green-600 font-mono">{longEstimates[i]?.toFixed(1) ?? '–'}</td>
                      <td className="py-2 font-mono font-bold text-indigo-700">{ind.longRunPES}</td>
                      <td className="py-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                          {pesTypeLabel(ind.longRunPES)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">{t('PES értékek — rövid és hosszú táv', 'PES values — short and long run')}</h2>
              <ElasticityChart
                type="pes"
                industries={scenario.industries}
                shortEstimates={shortEstimates.map(v => v ?? 0)}
                longEstimates={longEstimates.map(v => v ?? 0)}
              />
            </div>

            {/* Tanulság */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-black text-amber-900 text-lg mb-4">💡 {t('Tanulság', 'Key takeaway')}</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-xl p-4 border border-amber-100">
                  <h4 className="font-bold text-slate-900 mb-1">{t('Rövid vs. hosszú táv', 'Short vs. long run')}</h4>
                  <p className="text-slate-700">{t('Rövid távon a termelők nem tudnak gyorsan reagálni az áremelkedésre — a kapacitás korlátozott. Hosszú távon új termelők léphetnek be, kapacitás bővülhet, így a kínálat rugalmasabbá válik.', 'In the short run producers cannot quickly respond to price rises — capacity is limited. In the long run new producers can enter and capacity can expand, making supply more elastic.')}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-amber-100">
                  <h4 className="font-bold text-slate-900 mb-1">{t('Digitális vs. fizikai termékek', 'Digital vs. physical products')}</h4>
                  <p className="text-slate-700">{t('A szoftver extrém rugalmas kínálatú (PES ≈ 8–12): ha az ár emelkedik, a szoftvercég szinte azonnal és korlátlan mennyiségben tud több licencet eladni — a határköltség közel nulla. A koncertterem ezzel szemben tökéletesen rugalmatlan kínálatú (PES ≈ 0): hiába emelkedik a jegyár, a teremüzemeltető nem tud több ülőhelyet kínálni — a kapacitás fizikailag adott.', 'Software is extremely elastic (PES ≈ 8–12) because marginal cost is near zero. Concert halls are perfectly inelastic because capacity is physically limited.')}</p>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('Toplista — 2. szint (PES)', 'Leaderboard — Level 2 (PES)')}</h2>
              <Leaderboard level={22} refreshKey={leaderboardKey} />
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Link to="/games/elasticity/level/1"
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm text-center">
                {t('← Level 1', '← Level 1')}
              </Link>
              <Link to="/games/elasticity/level/3"
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md">
                {t('Level 3 →', 'Level 3 →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
