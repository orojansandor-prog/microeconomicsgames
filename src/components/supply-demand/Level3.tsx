import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { solvePriceCeiling, solvePriceFloor, solveEquilibrium } from '../../engine/supply-demand'
import { SD_LEVEL3_QUIZ, pickQuestions } from '../../engine/supply-demand-quiz'
import { SD_LEVEL3_SCENARIOS, pickSDRandom } from '../../engine/supply-demand-scenarios'
import { submitScore, calcTimeBonus } from '../../lib/scores'
import SupplyDemandChart from './charts/SupplyDemandChart'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import NotationBox from '../NotationBox'
import Leaderboard from '../Leaderboard'

type Phase = 'choose' | 'try' | 'quiz' | 'reveal'
type Scenario = 'ceiling' | 'floor'

const TOTAL_SECONDS = 120

function calcAccuracyInline(playerGuess: number, correct: number): number {
  const diff = Math.abs(playerGuess - correct)
  if (diff === 0) return 200
  if (diff <= 5) return 150
  if (diff <= 10) return 100
  if (diff <= 15) return 60
  return 20
}

export default function SDLevel3() {
  const { t } = useI18n()
  const { session } = useAuth()

  const [sc] = useState(() => pickSDRandom(SD_LEVEL3_SCENARIOS))
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const PARAMS = sc.params
  const CEILING_PRICE = sc.ceilingPrice
  const FLOOR_PRICE = sc.floorPrice

  const [phase, setPhase] = useState<Phase>('choose')
  const [scenario, setScenario] = useState<Scenario>('ceiling')
  // A játékos tippje a hiány/felesleg mértékére
  const [playerGapGuess, setPlayerGapGuess] = useState(20)
  const [timerRunning, setTimerRunning] = useState(false)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(SD_LEVEL3_QUIZ, 3))

  const [accuracyPoints, setAccuracyPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const eq = solveEquilibrium(PARAMS)
  const Qstar = eq.Q
  const Pstar = eq.P

  // Rögzített számítások
  const ceilReveal = solvePriceCeiling(PARAMS, CEILING_PRICE)
  const floorReveal = solvePriceFloor(PARAMS, FLOOR_PRICE)
  const correctGap = scenario === 'ceiling'
    ? ceilReveal.shortage_surplus
    : floorReveal.shortage_surplus

  const { A, Bd, C, Bs } = PARAMS

  // Equation labels
  const demandLabel = `P = ${A} − ${Bd === 1 ? '' : Bd}Q`
  const supplyLabel = `P = ${C} + ${Bs === 1 ? '' : Bs}Q`

  const handleChooseScenario = (choice: Scenario) => {
    setScenario(choice)
    setPlayerGapGuess(20)
    setPhase('try')
    setTimerRunning(true)
  }

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
    const ap = calcAccuracyInline(playerGapGuess, correctGap)
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
        level: 7,
        score: total,
        accuracy_points: ap,
        time_bonus: tb,
        quiz_points: qp,
        time_taken_seconds: TOTAL_SECONDS - secondsRemainingRef.current,
        scenario_id: scenario === 'ceiling' ? `${sc.id}-ceiling` : `${sc.id}-floor`,
      }).then(() => setLeaderboardKey(k => k + 1)).catch(() => {})
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
              <Link to="/games/supply-demand" className="hover:text-indigo-600 transition-colors">
                {t('Kereslet-kínálat', 'Supply & Demand')}
              </Link>
              <span>›</span>
              <span className="text-slate-700 font-semibold">3. {t('Árplafon és Árpadló', 'Price Controls')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {t('Mire vezet az állami árszabályozás?', 'What happens when the government controls prices?')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {phase !== 'reveal' && phase !== 'choose' && (
              <GameTimer
                totalSeconds={TOTAL_SECONDS}
                running={timerRunning}
                onExpire={handleTimerExpire}
                onTick={handleTimerTick}
              />
            )}
            <div className="flex items-center gap-1">
              <Link to="/games/supply-demand/level/1" className="w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">1</Link>
              <Link to="/games/supply-demand/level/2" className="w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">2</Link>
              <Link to="/games/supply-demand/level/3" className="w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-indigo-600 text-white shadow-sm">3</Link>
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

        {/* ── CHOOSE PHASE ── */}
        {phase === 'choose' && (
          <>
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-6">
              <div className="flex gap-4">
                <div className="text-4xl flex-shrink-0">{sc.icon}</div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base mb-1">
                    {t(sc.titleHu, sc.titleEn)}
                  </h2>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {t(sc.storyHu, sc.storyEn)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">
                      {t('Kereslet', 'Demand')}: {demandLabel}
                    </span>
                    <span className="text-xs bg-white border border-emerald-200 text-emerald-700 px-2 py-1 rounded-lg font-semibold">
                      {t('Kínálat', 'Supply')}: {supplyLabel}
                    </span>
                    <span className="text-xs bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-lg font-semibold">
                      {t('Egyensúly', 'Equilibrium')}: P* = {Pstar}, Q* = {Qstar}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleChooseScenario('ceiling')}
                className="group bg-white rounded-2xl border-2 border-slate-200 hover:border-red-400 hover:shadow-md p-6 text-left transition-all"
              >
                <div className="text-4xl mb-3">🏠</div>
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  {t('Árplafon (maximum ár)', 'Price Ceiling (maximum price)')}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t(
                    `A Kormány ${CEILING_PRICE} Ft-ban maximalizálja az árat. Olcsóbb lesz — de mi a következmény?`,
                    `The Government caps the price at ${CEILING_PRICE}. Cheaper for buyers — but what is the consequence?`
                  )}
                </p>
                <div className="mt-3 inline-block text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                  P ≤ {CEILING_PRICE}
                </div>
              </button>

              <button
                onClick={() => handleChooseScenario('floor')}
                className="group bg-white rounded-2xl border-2 border-slate-200 hover:border-orange-400 hover:shadow-md p-6 text-left transition-all"
              >
                <div className="text-4xl mb-3">🌾</div>
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  {t('Árpadló (minimum ár)', 'Price Floor (minimum price)')}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t(
                    `A Kormány ${FLOOR_PRICE} Ft-ban rögzíti a minimum árat. Magasabb bevétel a termelőknek — de mi a következmény?`,
                    `The Government sets the minimum price at ${FLOOR_PRICE}. Higher revenue for producers — but what is the consequence?`
                  )}
                </p>
                <div className="mt-3 inline-block text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                  P ≥ {FLOOR_PRICE}
                </div>
              </button>
            </div>
          </>
        )}

        {/* ── TRY PHASE ── */}
        {phase === 'try' && (
          <>
            <div className={`rounded-2xl border p-6 ${scenario === 'ceiling'
              ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100'
              : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100'}`}>
              <div className="flex gap-4">
                <div className="text-4xl flex-shrink-0">{scenario === 'ceiling' ? '🏠' : '🌾'}</div>
                <div className="flex-1">
                  <h2 className="font-bold text-slate-900 text-base mb-2">
                    {scenario === 'ceiling'
                      ? t('A Kormány ársapkát vezet be', 'The Government introduces a price cap')
                      : t('A Kormány árpadlót vezet be', 'The Government introduces a price floor')}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-2 mb-3">
                    <div className="bg-white rounded-xl p-3 border border-slate-200">
                      <div className="text-xs text-slate-500 mb-1">{t('Keresleti függvény', 'Demand function')}</div>
                      <div className="font-mono font-bold text-indigo-700">{demandLabel}</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200">
                      <div className="text-xs text-slate-500 mb-1">{t('Kínálati függvény', 'Supply function')}</div>
                      <div className="font-mono font-bold text-emerald-700">{supplyLabel}</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200">
                      <div className="text-xs text-slate-500 mb-1">{t('Egyensúlyi ár', 'Equilibrium price')}</div>
                      <div className="font-mono font-bold text-slate-700">P* = {Pstar}, Q* = {Qstar}</div>
                    </div>
                    <div className={`rounded-xl p-3 border-2 ${scenario === 'ceiling'
                      ? 'bg-red-50 border-red-300'
                      : 'bg-orange-50 border-orange-300'}`}>
                      <div className="text-xs text-slate-500 mb-1">
                        {scenario === 'ceiling'
                          ? t('Kormány által rögzített ársapka', 'Government-set price cap')
                          : t('Kormány által rögzített árpadló', 'Government-set price floor')}
                      </div>
                      <div className={`font-mono font-bold text-lg ${scenario === 'ceiling' ? 'text-red-700' : 'text-orange-700'}`}>
                        P{scenario === 'ceiling' ? '_max' : '_min'} = {scenario === 'ceiling' ? CEILING_PRICE : FLOOR_PRICE}
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${scenario === 'ceiling' ? 'text-red-800' : 'text-orange-800'}`}>
                    {scenario === 'ceiling'
                      ? t(
                          `A Kormány P = ${CEILING_PRICE} Ft-ban maximalizálta az árat. Számítsd ki: mekkora hiány keletkezik?`,
                          `The Government capped the price at P = ${CEILING_PRICE}. Calculate: what shortage will result?`
                        )
                      : t(
                          `A Kormány P = ${FLOOR_PRICE} Ft-ban rögzítette a minimumárat. Számítsd ki: mekkora felesleg keletkezik?`,
                          `The Government set the minimum price at P = ${FLOOR_PRICE}. Calculate: what surplus will result?`
                        )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {scenario === 'ceiling'
                  ? t(`Grafikon — ársapka P = ${CEILING_PRICE}`, `Chart — price cap P = ${CEILING_PRICE}`)
                  : t(`Grafikon — árpadló P = ${FLOOR_PRICE}`, `Chart — price floor P = ${FLOOR_PRICE}`)}
              </h2>
              <p className="text-xs text-slate-400 mb-3">
                {scenario === 'ceiling'
                  ? t('Hol metszi az ársapka-vonal a keresleti és kínálati görbét?', 'Where does the cap line intersect demand and supply?')
                  : t('Hol metszi az árpadló-vonal a keresleti és kínálati görbét?', 'Where does the floor line intersect demand and supply?')}
              </p>
              <SupplyDemandChart
                A={PARAMS.A} Bd={PARAMS.Bd} C={PARAMS.C} Bs={PARAMS.Bs}
                priceCeiling={scenario === 'ceiling' ? CEILING_PRICE : undefined}
                priceFloor={scenario === 'floor' ? FLOOR_PRICE : undefined}
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {scenario === 'ceiling'
                  ? t('A te becslésed: mekkora a hiány (Qd − Qs)?', 'Your estimate: how large is the shortage (Qd − Qs)?')
                  : t('A te becslésed: mekkora a felesleg (Qs − Qd)?', 'Your estimate: how large is the surplus (Qs − Qd)?')}
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                {t(
                  'Számítsd ki a keresleti és kínálati függvényből, majd állítsd be a csúszkával!',
                  'Calculate from the demand and supply functions, then set the slider!'
                )}
              </p>

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600 font-medium">
                  {scenario === 'ceiling' ? 'Qd − Qs =' : 'Qs − Qd ='}
                </span>
                <span className={`text-5xl font-black ${scenario === 'ceiling' ? 'text-red-600' : 'text-orange-600'}`}>
                  {playerGapGuess}
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={Math.round((A - C) / Math.min(Bd, Bs))}
                step={5}
                value={playerGapGuess}
                onChange={e => setPlayerGapGuess(Number(e.target.value))}
                className={`w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer ${scenario === 'ceiling' ? 'accent-red-500' : 'accent-orange-500'}`}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0 {t('(nincs hiány/felesleg)', '(no gap)')}</span>
                <span>{Math.round((A - C) / Math.min(Bd, Bs))} {t('(nagy eltérés)', '(large gap)')}</span>
              </div>

              <div className="mt-4 bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed">
                💡 {t(
                  scenario === 'ceiling'
                    ? `Tipp: P = ${CEILING_PRICE}-nél Qd = (${A} − ${CEILING_PRICE}) / ${Bd} = ? és Qs = (${CEILING_PRICE} − ${C}) / ${Bs} = ?`
                    : `Tipp: P = ${FLOOR_PRICE}-nál Qs = (${FLOOR_PRICE} − ${C}) / ${Bs} = ? és Qd = (${A} − ${FLOOR_PRICE}) / ${Bd} = ?`,
                  scenario === 'ceiling'
                    ? `Hint: At P = ${CEILING_PRICE}: Qd = (${A} − ${CEILING_PRICE}) / ${Bd} = ? and Qs = (${CEILING_PRICE} − ${C}) / ${Bs} = ?`
                    : `Hint: At P = ${FLOOR_PRICE}: Qs = (${FLOOR_PRICE} − ${C}) / ${Bs} = ? and Qd = (${A} − ${FLOOR_PRICE}) / ${Bd} = ?`
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-lg shadow-md hover:shadow-lg"
            >
              {t('Beküldöm a válaszomat! →', 'Submit my answer! →')}
            </button>
          </>
        )}

        {/* ── QUIZ PHASE ── */}
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

        {/* ── REVEAL PHASE ── */}
        {phase === 'reveal' && (
          <>
            {/* Score card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <h2 className="text-lg font-black mb-4">🏆 {t('Eredményed', 'Your score')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: t('Pontosság', 'Accuracy'), value: accuracyPoints, max: 200 },
                  { label: t('Időbónusz', 'Time bonus'), value: timeBonus, max: 300 },
                  { label: t('Kvíz', 'Quiz'), value: quizPoints, max: 300 },
                  { label: t('Összesen', 'Total'), value: totalScore, max: 800, highlight: true },
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

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {scenario === 'ceiling'
                  ? t(`Árplafon P=${CEILING_PRICE} hatása`, `Effect of price ceiling P=${CEILING_PRICE}`)
                  : t(`Árpadló P=${FLOOR_PRICE} hatása`, `Effect of price floor P=${FLOOR_PRICE}`)}
              </h2>
              <SupplyDemandChart
                A={PARAMS.A} Bd={PARAMS.Bd} C={PARAMS.C} Bs={PARAMS.Bs}
                showEquilibrium showCS showPS showDWL
                priceCeiling={scenario === 'ceiling' ? CEILING_PRICE : undefined}
                priceFloor={scenario === 'floor' ? FLOOR_PRICE : undefined}
              />
            </div>

            {/* Comparison table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">
                {scenario === 'ceiling'
                  ? t(`Összehasonlítás: Egyensúly vs. Árplafon (P=${CEILING_PRICE})`, `Comparison: Equilibrium vs. Ceiling (P=${CEILING_PRICE})`)
                  : t(`Összehasonlítás: Egyensúly vs. Árpadló (P=${FLOOR_PRICE})`, `Comparison: Equilibrium vs. Floor (P=${FLOOR_PRICE})`)}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {t('Mutató', 'Indicator')}
                      </th>
                      <th className="text-center py-2 px-3 text-indigo-600 font-bold text-xs uppercase">
                        {t('Egyensúly', 'Equilibrium')} (P*={Pstar})
                      </th>
                      <th className="text-center py-2 px-3 font-bold text-xs uppercase" style={{ color: scenario === 'ceiling' ? '#ef4444' : '#f97316' }}>
                        {scenario === 'ceiling' ? t(`Árplafon (P=${CEILING_PRICE})`, `Ceiling (P=${CEILING_PRICE})`) : t(`Árpadló (P=${FLOOR_PRICE})`, `Floor (P=${FLOOR_PRICE})`)}
                      </th>
                      <th className="text-center py-2 px-3 text-slate-500 font-bold text-xs uppercase">
                        {t('Változás', 'Change')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(scenario === 'ceiling' ? [
                      { label: 'P', eq: `${Pstar}`, inter: `${CEILING_PRICE}`, delta: `−${Pstar - CEILING_PRICE}` },
                      { label: `Q ${t('(tranzakció)', '(traded)')}`, eq: `${Qstar}`, inter: `${ceilReveal.Q_traded}`, delta: `${ceilReveal.Q_traded - Qstar}` },
                      { label: t('Hiány (Shortage)', 'Shortage'), eq: '0', inter: `${ceilReveal.shortage_surplus}`, delta: `+${ceilReveal.shortage_surplus}`, bad: true },
                      { label: 'CS', eq: `${eq.CS}`, inter: `${ceilReveal.CS}`, delta: `${ceilReveal.CS - eq.CS}`, good: ceilReveal.CS > eq.CS },
                      { label: 'PS', eq: `${eq.PS}`, inter: `${ceilReveal.PS}`, delta: `${ceilReveal.PS - eq.PS}`, bad: true },
                      { label: 'DWL', eq: '0', inter: `${ceilReveal.DWL}`, delta: `+${ceilReveal.DWL}`, bad: true },
                    ] : [
                      { label: 'P', eq: `${Pstar}`, inter: `${FLOOR_PRICE}`, delta: `+${FLOOR_PRICE - Pstar}` },
                      { label: `Q ${t('(tranzakció)', '(traded)')}`, eq: `${Qstar}`, inter: `${floorReveal.Q_traded}`, delta: `${floorReveal.Q_traded - Qstar}` },
                      { label: t('Felesleg (Surplus)', 'Surplus'), eq: '0', inter: `${floorReveal.shortage_surplus}`, delta: `+${floorReveal.shortage_surplus}`, bad: true },
                      { label: 'CS', eq: `${eq.CS}`, inter: `${floorReveal.CS}`, delta: `${floorReveal.CS - eq.CS}`, bad: true },
                      { label: 'PS', eq: `${eq.PS}`, inter: `${floorReveal.PS}`, delta: `${floorReveal.PS - eq.PS}`, good: floorReveal.PS > eq.PS },
                      { label: 'DWL', eq: '0', inter: `${floorReveal.DWL}`, delta: `+${floorReveal.DWL}`, bad: true },
                    ]).map(row => (
                      <tr key={row.label} className="border-b border-slate-100">
                        <td className="py-2.5 px-3 text-slate-600 font-medium">{row.label}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-indigo-700">{row.eq}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold" style={{ color: scenario === 'ceiling' ? '#dc2626' : '#ea580c' }}>{row.inter}</td>
                        <td className={`py-2.5 px-3 text-center font-mono font-semibold ${row.bad ? 'text-red-600' : row.good ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {row.delta}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lesson */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-6">
              <h3 className="font-black text-indigo-900 text-lg mb-5">
                💡 {t('Tanulság', 'Key takeaway')}
              </h3>

              {scenario === 'ceiling' ? (
                <div className="space-y-3 text-sm">
                  <div className="bg-white rounded-xl p-4 border border-indigo-100">
                    <h4 className="font-bold text-slate-900 mb-1.5">⚠️ {t('Az árplafon hatása', 'Effect of the price ceiling')}</h4>
                    <p className="text-slate-700 leading-relaxed">
                      {t(
                        'Az árplafon nem szünteti meg a szűkösséget — csak eltávolítja a piacot az egyensúlytól. Ha az ár "mesterségesen" alacsony, a kereslet meghaladja a kínálatot → hiány → sorban állás, feketepiac, allokációs hatékonyságveszteség.',
                        'The price ceiling does not eliminate scarcity — it just moves the market away from equilibrium. When the price is artificially low, demand exceeds supply → shortage → queuing, black markets, allocative efficiency loss.'
                      )}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-indigo-100">
                    <div className="text-xs font-bold text-indigo-700 mb-1.5">🏙️ {t('Valós példa', 'Real example')}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t(
                        'Lakásbérleti árkontroll (pl. Berlin, New York): olcsó bérletek → várakozási listák, illegális felárak, a bérlők jólétének vélt intézkedés valójában beruházáshiányt okoz.',
                        'Rent control (e.g. Berlin, New York): cheap rents → waiting lists, illegal premiums; a policy meant to help tenants actually causes underinvestment in housing.'
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="bg-white rounded-xl p-4 border border-indigo-100">
                    <h4 className="font-bold text-slate-900 mb-1.5">⚠️ {t('Az árpadló hatása', 'Effect of the price floor')}</h4>
                    <p className="text-slate-700 leading-relaxed">
                      {t(
                        'Az árpadló felesleget okoz: a termelők többet kínálnak, mint amennyit a vevők hajlandók megvenni ezen az áron. A minimum garantál ugyan magasabb bevételt az eladóknak, de a nem megvalósuló tranzakciók DWL-t okoznak.',
                        'A price floor causes a surplus: producers supply more than buyers want at that price. The minimum guarantees higher revenue for sellers, but unrealised transactions cause DWL.'
                      )}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-indigo-100">
                    <div className="text-xs font-bold text-indigo-700 mb-1.5">🏭 {t('Valós példa', 'Real example')}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t(
                        'Minimálbér: a bérek emelkednek, de a foglalkoztatás csökkenthet, ha a bér az egyensúly fölé kerül. Mezőgazdasági ártámogatások: felesleg termelés → az EU felvásárolja.',
                        'Minimum wage: wages rise but employment may fall if the wage exceeds equilibrium. Agricultural price supports: surplus production → the EU buys up excess supply.'
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            
            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('3. szint (SD)', 'Level 3 (SD)')}</h2>
              <Leaderboard level={7} refreshKey={leaderboardKey} />
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Link to="/games/supply-demand/level/2"
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm text-center">
                {t('← 2. szint', '← Level 2')}
              </Link>
              <Link to="/games/supply-demand/level/4"
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md">
                {t('4. szint — Adó és Jólét →', 'Level 4 — Tax & Welfare →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
