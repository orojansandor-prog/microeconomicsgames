/**
 * 3. szint — Fogyasztói optimum
 * Productive failure: a játékos a budget line-on mozog, próbálja a legmagasabb IC-t elérni.
 * Az optimum az érintési pontban van: MRS = Px/Py.
 * Ritmus: csinálja → leleplezés → miért
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { submitScore, calcAccuracyPoints, calcTimeBonus } from '../../lib/scores'
import GameTimer from '../GameTimer'
import {
  solveOptimum,
  utilityAt,
  mrsAt,
  budgetY,
  xIntercept,
  generateBCTable,
} from '../../engine/budget-constraint'
import { BC_SCENARIOS, pickBCRandom } from '../../engine/bc-scenarios'
import BudgetChart from './charts/BudgetChart'
import NotationBox from '../NotationBox'
import Leaderboard from '../Leaderboard'

type Phase = 'try' | 'reveal'

const TOTAL_SECONDS = 120

export default function BCLevel3() {
  const { t } = useI18n()
  const { session } = useAuth()
  const [sc] = useState(() => pickBCRandom(BC_SCENARIOS))
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const p = sc.params
  const [phase, setPhase] = useState<Phase>('try')
  const [playerX, setPlayerX] = useState(Math.round(xIntercept(p) / 4))
  const [timerRunning, setTimerRunning] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_SECONDS)
  const [scored, setScored] = useState(false)

  const opt = solveOptimum(p)
  const X_max = xIntercept(p)

  const playerY = budgetY(p, playerX)
  const playerU = utilityAt(p, playerX, playerY)
  const playerMRS = mrsAt(p, playerX, playerY)
  const isOptimal = Math.abs(playerX - opt.X_star) < 0.5 && Math.abs(playerY - opt.Y_star) < 0.5

  const U_low = utilityAt(p, Math.round(X_max * 0.2), budgetY(p, Math.round(X_max * 0.2)))
  const U_opt = opt.U_star
  const U_high = opt.U_star * 1.12

  const tableRows = generateBCTable(p, 6)

  const priceRatio = p.Px / p.Py

  const ap = calcAccuracyPoints(playerX, opt.X_star)
  const tb = calcTimeBonus(timeRemaining, TOTAL_SECONDS)
  const total = ap + tb

  const handleTimerTick = (r: number) => setTimeRemaining(r)
  const handleTimerExpire = () => setTimerRunning(false)

  const handleReveal = () => {
    setTimerRunning(false)
    setPhase('reveal')
    const tbNow = calcTimeBonus(timeRemaining, TOTAL_SECONDS)
    const apNow = calcAccuracyPoints(playerX, opt.X_star)
    const totalNow = apNow + tbNow
    if (session && !scored) {
      setScored(true)
      submitScore({
        user_id: session.user.id,
        user_email: session.user.email!,
        level: 15,
        score: totalNow,
        accuracy_points: apNow,
        time_bonus: tbNow,
        quiz_points: 0,
        time_taken_seconds: TOTAL_SECONDS - timeRemaining,
        scenario_id: `bc-l3-${sc.id}`,
      }).then(() => setLeaderboardKey(k => k + 1))
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
              <Link to="/games/budget-constraint" className="hover:text-indigo-600 transition-colors">
                {t('Fogyasztáselmélet', 'Consumer Theory')}
              </Link>
              <span>›</span>
              <span className="text-slate-700 font-semibold">3. {t('Fogyasztói optimum', 'Consumer Optimum')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {t('Melyik pont a budget line-on a legjobb?', 'Which point on the budget line is best?')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <GameTimer
              totalSeconds={TOTAL_SECONDS}
              running={timerRunning}
              onExpire={handleTimerExpire}
              onTick={handleTimerTick}
            />
            <div className="flex items-center gap-1">
              {[1,2,3,4].map(n => (
                <Link key={n} to={`/games/budget-constraint/level/${n}`}
                  className={`w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                    n === 3
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-pink-300 hover:text-pink-600'
                  }`}>{n}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <NotationBox notations={[
          { symbol: 'X*, Y*', full: 'Optimális mennyiség (Optimal quantities)', altSymbols: 'x*, y*, optimum' },
          { symbol: 'MRS', full: 'Helyettesítési határráta (MRS)', formula: 'MRS = α/(1−α) · Y/X', altSymbols: 'szubjektív árráta' },
          { symbol: 'Px/Py', full: 'Árráta (Price ratio)', note: 'az objektív csereráta a piacon' },
          { symbol: 'MRS = Px/Py', full: 'Optimum feltétele', note: 'szubjektív és objektív csereráta egyenlő' },
          { symbol: 'U*', full: 'Maximális hasznosság az optimumban', altSymbols: 'U_max' },
        ]} />

        {/* Szituáció */}
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100 p-6">
          <div className="flex gap-4">
            <div className="text-4xl flex-shrink-0">{sc.icon}</div>
            <div>
              <h2 className="font-bold text-slate-900 text-base mb-1">
                {t('Találd meg az optimumot!', 'Find the optimum!')}
              </h2>
              <p className="text-slate-700 leading-relaxed text-sm">
                {t(
                  `${p.I.toLocaleString()} Ft-od van. ${p.labelX} ${p.Px} Ft, ${p.labelY} ${p.Py} Ft. A budget line-on pontosan el kell költened a pénzed. Melyik X-Y kombinációnál a legnagyobb a hasznosságod?`,
                  `You have ${p.I.toLocaleString()} Ft. ${p.labelX} ${p.Px} Ft, ${p.labelY} ${p.Py} Ft. You must spend exactly your budget. At which X-Y combination is your utility highest?`,
                )}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs bg-white border border-pink-200 text-pink-700 px-2 py-1 rounded-lg font-semibold">I = {p.I.toLocaleString()} Ft</span>
                <span className="text-xs bg-white border border-pink-200 text-pink-700 px-2 py-1 rounded-lg font-semibold">Px = {p.Px} Ft</span>
                <span className="text-xs bg-white border border-pink-200 text-pink-700 px-2 py-1 rounded-lg font-semibold">Py = {p.Py} Ft</span>
                <span className="text-xs bg-white border border-pink-200 text-pink-700 px-2 py-1 rounded-lg font-semibold">U(X,Y) = √(X·Y)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TRY PHASE ── */}
        {phase === 'try' && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-bold text-slate-800">{t('Mozogj a budget line-on:', 'Move along the budget line:')}</h2>
                <div className="text-right">
                  <div className="text-4xl font-black text-pink-600">{playerX}</div>
                  <div className="text-xs text-slate-400">db {p.labelX}</div>
                </div>
              </div>

              <input
                type="range"
                min={1}
                max={X_max - 1}
                step={0.5}
                value={playerX}
                onChange={e => setPlayerX(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-pink-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1 mb-5">
                <span>1 {p.labelX} ({(budgetY(p, 1)).toFixed(1)} {p.labelY})</span>
                <span>{X_max - 1} {p.labelX} ({(budgetY(p, X_max - 1)).toFixed(1)} {p.labelY})</span>
              </div>

              {/* Élő mutatók */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: `X (${p.labelX})`, value: `${playerX} db`, color: 'text-amber-600', icon: sc.icon },
                  { label: `Y (${p.labelY})`, value: `${playerY.toFixed(1)} db`, color: 'text-emerald-600', icon: '🛒' },
                  {
                    label: 'Hasznosság (U)', value: playerU.toFixed(2), color: 'text-pink-600', icon: '⭐',
                    sub: `max: ${opt.U_star.toFixed(2)}`,
                  },
                  {
                    label: 'MRS', value: playerMRS.toFixed(2), color: playerMRS > priceRatio + 0.05 ? 'text-red-500' : playerMRS < priceRatio - 0.05 ? 'text-orange-500' : 'text-green-600', icon: '⚖️',
                    sub: `Px/Py = ${priceRatio.toFixed(2)}`,
                  },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-lg mb-0.5">{item.icon}</div>
                    <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                    <div className={`text-xl font-black ${item.color}`}>{item.value}</div>
                    {'sub' in item && item.sub && (
                      <div className="text-xs text-slate-400 mt-0.5">{item.sub}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Irányítás */}
              <div className="mt-4 p-3 rounded-xl border text-xs leading-relaxed
                  bg-amber-50 border-amber-200 text-amber-800">
                {playerMRS > priceRatio + 0.05
                  ? `⬆️ ${t(`MRS (${playerMRS.toFixed(2)}) > Px/Py (${priceRatio.toFixed(2)}) → még érdemes több ${p.labelX}-t venni! Mozogj jobbra.`, `MRS (${playerMRS.toFixed(2)}) > Px/Py (${priceRatio.toFixed(2)}) → still worth buying more ${p.labelX}! Move right.`)}`
                  : playerMRS < priceRatio - 0.05
                  ? `⬇️ ${t(`MRS (${playerMRS.toFixed(2)}) < Px/Py (${priceRatio.toFixed(2)}) → túl sok ${p.labelX}-d van. Mozogj balra.`, `MRS (${playerMRS.toFixed(2)}) < Px/Py (${priceRatio.toFixed(2)}) → you have too much ${p.labelX}. Move left.`)}`
                  : `✅ ${t('MRS ≈ Px/Py → Ez az optimum!', 'MRS ≈ Px/Py → This is the optimum!')}`
                }
              </div>
            </div>

            <button
              onClick={handleReveal}
              className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition-colors text-lg shadow-md"
            >
              {isOptimal
                ? t('🎯 Megtaláltam! Leleplezés →', '🎯 Found it! Reveal →')
                : t('Beküldöm a választásomat →', 'Submit my choice →')}
            </button>
          </>
        )}

        {/* ── REVEAL PHASE ── */}
        {phase === 'reveal' && (
          <>
            {/* Score banner */}
            <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-5 text-white">
              <h2 className="text-lg font-black mb-3">🏆 {t('Eredményed', 'Your score')}</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: t('Pontosság', 'Accuracy'), value: ap },
                  { label: t('Időbónusz', 'Time bonus'), value: tb },
                  { label: t('Összesen', 'Total'), value: total },
                ].map(item => (
                  <div key={item.label} className="bg-white/20 rounded-xl p-3 text-center">
                    <div className="text-xs opacity-80 mb-0.5">{item.label}</div>
                    <div className="text-2xl font-black">{item.value}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs opacity-80">
                {t(`Optimum: X*=${opt.X_star} | Te: X=${playerX}`, `Optimum: X*=${opt.X_star} | You: X=${playerX}`)}
              </p>
            </div>

            {/* Eredmény */}
            <div className={`rounded-2xl border-2 p-6 ${isOptimal
              ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50'
              : 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50'}`}>
              <div className="text-4xl mb-2">{isOptimal ? '🎯' : '📊'}</div>
              <h2 className="text-xl font-black text-slate-900 mb-1">
                {isOptimal
                  ? t('Tökéletes! Megtaláltad az optimumot.', 'Perfect! You found the optimum.')
                  : t(`Te X=${playerX}-t választottál — az optimum X*=${opt.X_star}, Y*=${opt.Y_star}.`, `You chose X=${playerX} — the optimum is X*=${opt.X_star}, Y*=${opt.Y_star}.`)}
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                {t(`Optimum feltétele: MRS = Px/Py → ${opt.MRS_star} = ${p.Px}/${p.Py}. X* = ${opt.X_star}, Y* = ${opt.Y_star}, U* = ${opt.U_star.toFixed(2)}.`,
                   `Optimum condition: MRS = Px/Py → ${opt.MRS_star} = ${p.Px}/${p.Py}. X* = ${opt.X_star}, Y* = ${opt.Y_star}, U* = ${opt.U_star.toFixed(2)}.`)}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: `X* (${p.labelX})`, value: `${opt.X_star} db`, color: 'text-amber-700' },
                  { label: `Y* (${p.labelY})`, value: `${opt.Y_star} db`, color: 'text-emerald-700' },
                  { label: 'U* (max)', value: opt.U_star.toFixed(2), color: 'text-pink-700' },
                  { label: t('A te U-d', 'Your U'), value: playerU.toFixed(2), color: isOptimal ? 'text-emerald-700' : 'text-orange-600' },
                ].map(item => (
                  <div key={item.label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                    <div className={`text-xl font-black ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grafikon */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {t('Grafikon — Budget line + IC görbék + optimum pont', 'Chart — Budget line + IC curves + optimum')}
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                {t('A zöld IC érinti a budget line-t az optimumban. Magasabb IC (szaggatott) már nem elérhető.', 'The green IC is tangent to the budget line at the optimum. The higher IC (dashed) is unattainable.')}
              </p>
              <BudgetChart
                params={p}
                budgetLines={[
                  { params: p, color: '#6366f1', name: t('Budget line', 'Budget line') },
                ]}
                curves={[
                  { U: U_low, color: '#cbd5e1', name: `IC (U=${U_low.toFixed(2)})` },
                  { U: U_opt, color: '#10b981', name: `IC* (U=${U_opt.toFixed(2)})` },
                  { U: U_high, color: '#f87171', dash: '6 4', name: t('Elérhetetlen IC', 'Unattainable IC') },
                ]}
                dots={[
                  { X: opt.X_star, Y: opt.Y_star, color: '#10b981', label: `Opt (${opt.X_star}, ${opt.Y_star})` },
                  ...(isOptimal ? [] : [{ X: playerX, Y: playerY, color: '#f59e0b', label: t('Te', 'You') }]),
                ]}
              />
              <div className="mt-3 bg-pink-50 border border-pink-200 rounded-xl p-3">
                <p className="text-sm font-semibold text-pink-900">
                  {t('Az érintési pontban: meredekség(budget) = meredekség(IC) → −Px/Py = −MRS → MRS = Px/Py', 'At tangency: slope(budget) = slope(IC) → −Px/Py = −MRS → MRS = Px/Py')}
                </p>
              </div>
            </div>

            {/* Levezetés */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="bg-pink-100 text-pink-800 text-xs font-mono px-2 py-1 rounded-lg border border-pink-200">MRS = Px/Py</span>
                <span>{t('— Miért pontosan ez az optimum?', '— Why is this exactly the optimum?')}</span>
              </h2>
              <div className="space-y-3">
                {[
                  {
                    n: '1',
                    lbl: t('Lagrange feltétel', 'Lagrange condition'),
                    formula: `max U(X,Y) = √(X·Y), s.t. ${p.Px}X + ${p.Py}Y = ${p.I}`,
                    desc: t('Maximalizáljuk a hasznosságot a budget korlát mellett.', 'Maximise utility subject to the budget constraint.'),
                  },
                  {
                    n: '2',
                    lbl: t('Optimum feltétele', 'Optimality condition'),
                    formula: `MRS = Px/Py → (α/(1−α))·(Y/X) = ${p.Px}/${p.Py} = ${(p.Px/p.Py).toFixed(2)}`,
                    desc: t('Az IC meredeksége = a budget line meredeksége (érintési feltétel).', 'IC slope = budget line slope (tangency condition).'),
                  },
                  {
                    n: '3',
                    lbl: t('X* megoldása', 'Solving for X*'),
                    formula: `X* = α·I/Px = ${p.alpha}·${p.I}/${p.Px} = ${opt.X_star}`,
                    desc: t(`Cobb-Douglasnál az optimális kiadás α-arányban megy X-re, (1-α)-ban Y-ra.`, `With Cobb-Douglas, fraction α of income goes to X, fraction (1−α) to Y.`),
                  },
                  {
                    n: '4',
                    lbl: t('Y* megoldása', 'Solving for Y*'),
                    formula: `Y* = (1−α)·I/Py = ${1-p.alpha}·${p.I}/${p.Py} = ${opt.Y_star}`,
                    desc: t('A jövedelem másik fele Y-ra megy.', 'The other portion of income goes to Y.'),
                  },
                  {
                    n: '5',
                    lbl: t('Ellenőrzés', 'Check'),
                    formula: `${p.Px}·${opt.X_star} + ${p.Py}·${opt.Y_star} = ${p.Px * opt.X_star} + ${p.Py * opt.Y_star} = ${p.I} Ft ✓`,
                    desc: t('A budget korlát teljesül: pontosan elköltöttük a jövedelmet.', 'The budget constraint holds: income is exactly exhausted.'),
                  },
                ].map(s => (
                  <div key={s.n} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-pink-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.n}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs font-semibold text-slate-500">{s.lbl}:</span>
                        <code className="text-sm font-mono font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-100 break-all">{s.formula}</code>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Táblázat */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {t('Tábla — U és MRS a budget line mentén', 'Table — U and MRS along the budget line')}
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                {t(`Zöld sor = optimum (MRS = Px/Py = ${(p.Px/p.Py).toFixed(2)}). Ahol MRS > Px/Py: még vegyél több ${p.labelX}-t. Ahol MRS < Px/Py: vegyél kevesebbet.`, `Green row = optimum (MRS = Px/Py = ${(p.Px/p.Py).toFixed(2)}). Where MRS > ratio: buy more ${p.labelX}. Where MRS < ratio: buy less.`)}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {[`X (${p.labelX})`, `Y (${p.labelY})`, 'U = √(X·Y)', 'MRS = Y/X', 'Px/Py', 'Helyzet'].map(h => (
                        <th key={h} className="py-2 px-2 text-xs font-bold text-slate-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map(row => (
                      <tr key={row.X} className={`border-b border-slate-100 ${row.isOptimal ? 'bg-emerald-50' : ''}`}>
                        <td className="py-2 px-2 font-mono font-bold text-slate-800">{row.X}</td>
                        <td className="py-2 px-2 font-mono text-slate-700">{row.Y}</td>
                        <td className={`py-2 px-2 font-mono font-bold ${row.isOptimal ? 'text-emerald-700' : 'text-slate-600'}`}>{row.U}</td>
                        <td className="py-2 px-2 font-mono text-slate-600">{row.MRS}</td>
                        <td className="py-2 px-2 font-mono text-slate-400">{row.price_ratio}</td>
                        <td className="py-2 px-2 text-xs">
                          {row.isOptimal
                            ? <span className="text-emerald-600 font-bold">✓ Optimum</span>
                            : row.MRS > row.price_ratio
                            ? <span className="text-blue-500">→ több X</span>
                            : <span className="text-orange-500">← kevesebb X</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tanulság */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-2xl p-6">
              <h3 className="font-black text-pink-900 text-lg mb-4">💡 {t('Tanulság', 'Key takeaway')}</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-xl p-4 border border-pink-100">
                  <h4 className="font-bold text-slate-900 mb-1.5">🎯 {t('Mit jelent MRS = Px/Py?', 'What does MRS = Px/Py mean?')}</h4>
                  <p className="text-slate-700">
                    {t(
                      `Ha MRS > Px/Py (pl. MRS=1.5, de Px/Py=${(p.Px/p.Py).toFixed(2)}): te hajlandó lennél 1.5 ${p.labelY}-t adni 1 ${p.labelX}-ért, de a piac csak ${(p.Px/p.Py).toFixed(2)}-t kér érte. Érdemes több ${p.labelX}-t venni! Ha MRS < Px/Py: megfordítva. Az optimumban MRS = Px/Py = ${(p.Px/p.Py).toFixed(2)}: nincs előnyös csere.`,
                      `If MRS > Px/Py (e.g. MRS=1.5, Px/Py=${(p.Px/p.Py).toFixed(2)}): you would give 1.5 ${p.labelY} for 1 ${p.labelX}, but the market only asks ${(p.Px/p.Py).toFixed(2)}. Buy more ${p.labelX}! If MRS < Px/Py: reversed. At the optimum MRS = Px/Py = ${(p.Px/p.Py).toFixed(2)}: no beneficial trade is possible.`,
                    )}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-white rounded-xl border border-pink-100">
                    <div className="text-xs font-bold text-pink-700 mb-1.5">{sc.icon} {t('Valós példa', 'Real example')}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t(
                        'Bérlet (havi 9500 Ft) vs. egyedi jegy (350 Ft/db). Ha havonta 30+ napot utazol, a bérlet olcsóbb — de csak akkor. Az optimum attól függ, mennyire értékeled az utazás kényelmét vs. a pénzt.',
                        'Monthly pass (9,500 Ft) vs. single ticket (350 Ft each). If you travel 30+ days/month, the pass is cheaper — but only then. The optimum depends on how much you value travel convenience vs. money.',
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-pink-100">
                    <div className="text-xs font-bold text-pink-700 mb-1.5">📊 {t('Sarokponti megoldás (corner solution)', 'Corner solution')}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t(
                        `Ha valaki egyáltalán nem vesz ${p.labelX}-t (pl. allergiás), az optimum a sarokpontban lesz: X=0, Y=Y_max. Ekkor MRS ≠ Px/Py, de a belső megoldás nem létezik.`,
                        `If someone never buys ${p.labelX} (e.g. allergic), the optimum is at the corner: X=0, Y=Y_max. Here MRS ≠ Px/Py, but an interior solution does not exist.`,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            
            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('3. szint (FE)', 'Level 3 (BC)')}</h2>
              <Leaderboard level={15} refreshKey={leaderboardKey} />
            </div>

            {/* Navigáció */}
            <div className="flex gap-3">
              <button
                onClick={() => { setPhase('try'); setPlayerX(Math.round(X_max / 4)) }}
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm"
              >
                {t('← Próbálom újra', '← Try again')}
              </button>
              <Link
                to="/games/budget-constraint/level/4"
                className="flex-1 py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md"
              >
                {t('4. szint — Ár- és jövedelemváltozás →', 'Level 4 — Price & Income Effects →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
