/**
 * 4. szint — Ár- és jövedelemváltozás hatása (Slutsky-felbontás)
 * Productive failure: a játékos tippel a hatásokra, de nem tudja szétbontani
 * helyettesítési és jövedelemhatásra — a leleplezés megmutatja a felbontást.
 * Ritmus: csinálja → leleplezés → miért
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { submitScore, calcTimeBonus } from '../../lib/scores'
import GameTimer from '../GameTimer'
import {
  solveOptimum,
  solveSlutskyDecomposition,
  utilityAt,
} from '../../engine/budget-constraint'
import { BC_SCENARIOS, pickBCRandom } from '../../engine/bc-scenarios'
import BudgetChart from './charts/BudgetChart'
import NotationBox from '../NotationBox'
import Leaderboard from '../Leaderboard'

type Phase = 'try' | 'reveal'

const TOTAL_SECONDS = 120

export default function BCLevel4() {
  const { t } = useI18n()
  const { session } = useAuth()
  const [sc] = useState(() => pickBCRandom(BC_SCENARIOS))
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const p = sc.params
  const orig = solveOptimum(p)

  const [phase, setPhase] = useState<Phase>('try')
  const [newPx, setNewPx] = useState(sc.newPxDefault)
  const [_playerGuessX, setPlayerGuessX] = useState<number | null>(null)
  const [guessMode, setGuessMode] = useState<'sub_bigger' | 'inc_bigger' | 'equal' | null>(null)
  const [timerRunning, setTimerRunning] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_SECONDS)
  const [scored, setScored] = useState(false)

  const slutsky = solveSlutskyDecomposition(p, newPx)

  const U_orig = orig.U_star
  const U_slutsky = utilityAt({ ...p, Px: newPx, I: slutsky.I_slutsky }, slutsky.X_slutsky, slutsky.Y_slutsky)
  const U_new = slutsky.U_new

  const newParams = { ...p, Px: newPx }
  const slutskyParams = { ...p, Px: newPx, I: slutsky.I_slutsky }

  const calcGuessScore = (gm: typeof guessMode, sl: typeof slutsky) => {
    const subAbs = Math.abs(sl.substitution_effect)
    const incAbs = Math.abs(sl.income_effect)
    let ap = 0
    if (gm === 'sub_bigger' && subAbs > incAbs) ap = 500
    else if (gm === 'inc_bigger' && incAbs > subAbs) ap = 500
    else if (gm === 'equal' && subAbs === incAbs) ap = 500
    else if (gm !== null) ap = 100
    return ap
  }

  const tb = calcTimeBonus(timeRemaining, TOTAL_SECONDS)
  const ap = calcGuessScore(guessMode, slutsky)
  const total = ap + tb

  const handleTimerTick = (r: number) => setTimeRemaining(r)
  const handleTimerExpire = () => setTimerRunning(false)

  const handleReveal = () => {
    setTimerRunning(false)
    setPhase('reveal')
    const tbNow = calcTimeBonus(timeRemaining, TOTAL_SECONDS)
    const apNow = calcGuessScore(guessMode, slutsky)
    const totalNow = apNow + tbNow
    if (session && !scored) {
      setScored(true)
      submitScore({
        user_id: session.user.id,
        user_email: session.user.email!,
        level: 16,
        score: totalNow,
        accuracy_points: apNow,
        time_bonus: tbNow,
        quiz_points: 0,
        time_taken_seconds: TOTAL_SECONDS - timeRemaining,
        scenario_id: `bc-l4-${sc.id}`,
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
              <span className="text-slate-700 font-semibold">4. {t('Ár- és jövedelemhatás', 'Price & Income Effects')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {t(`Mi történik, ha megdrágul a(z) ${p.labelX}?`, `What happens when ${p.labelX} gets more expensive?`)}
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
                    n === 4
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-orange-300 hover:text-orange-600'
                  }`}>{n}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <NotationBox notations={[
          { symbol: 'SE', full: 'Helyettesítési hatás (Substitution Effect)', altSymbols: 'HS, comp. effect' },
          { symbol: 'IE', full: 'Jövedelemhatás (Income Effect)', altSymbols: 'JH, wealth effect' },
          { symbol: 'TE', full: 'Teljes hatás (Total Effect)', formula: 'TE = SE + IE' },
          { symbol: 'I_s', full: 'Slutsky-kompenzált jövedelem', note: 'annyit kap, hogy az eredeti kosarat megvehesse az új áron' },
          { symbol: "Px → Px\'", full: 'Árváltozás (Price change)', note: `a(z) ${p.labelX} ára változik` },
        ]} />

        {/* Szituáció */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-6">
          <div className="flex gap-4">
            <div className="text-4xl flex-shrink-0">{sc.icon}</div>
            <div>
              <h2 className="font-bold text-slate-900 text-base mb-1">
                {t(`A(z) ${p.labelX} ára megdrágul`, `${p.labelX} price increases`)}
              </h2>
              <p className="text-slate-700 leading-relaxed text-sm">
                {t(
                  `Korábban ${p.labelX} ${p.Px} Ft, ${p.labelY} ${p.Py} Ft, jövedelmed ${p.I.toLocaleString()} Ft volt. Az optimumod: X*=${orig.X_star} ${p.labelX}, Y*=${orig.Y_star} ${p.labelY}. Most a(z) ${p.labelX} ára változik — mi lesz az új optimum?`,
                  `Previously ${p.labelX} was ${p.Px} Ft, ${p.labelY} ${p.Py} Ft, income ${p.I.toLocaleString()} Ft. Your optimum: X*=${orig.X_star} ${p.labelX}, Y*=${orig.Y_star} ${p.labelY}. Now ${p.labelX}'s price changes — what will the new optimum be?`,
                )}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs bg-white border border-orange-200 text-orange-700 px-2 py-1 rounded-lg font-semibold">I = {p.I.toLocaleString()} Ft (változatlan)</span>
                <span className="text-xs bg-white border border-orange-200 text-orange-700 px-2 py-1 rounded-lg font-semibold">Py = {p.Py} Ft (változatlan)</span>
                <span className="text-xs bg-orange-100 border border-orange-300 text-orange-800 px-2 py-1 rounded-lg font-bold">Px: {p.Px} → {newPx} Ft ⬆️</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TRY PHASE ── */}
        {phase === 'try' && (
          <>
            {/* Ár-csúszka */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-bold text-slate-800">{t(`Állítsd be a(z) ${p.labelX} új árát:`, `Set the new ${p.labelX} price:`)}</h2>
                <div className="text-right">
                  <span className="text-4xl font-black text-orange-500">{newPx}</span>
                  <span className="text-lg font-semibold text-slate-400 ml-1">Ft</span>
                </div>
              </div>

              <input
                type="range"
                min={sc.newPxMin}
                max={sc.newPxMax}
                step={Math.round((sc.newPxMax - sc.newPxMin) / 20) || 50}
                value={newPx}
                onChange={e => { setNewPx(Number(e.target.value)); setPlayerGuessX(null); setGuessMode(null) }}
                className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1 mb-5">
                <span>{sc.newPxMin} Ft ({t('olcsóbb', 'cheaper')})</span>
                <span className="text-slate-500 font-semibold">{t('Eredeti', 'Original')}: {p.Px} Ft</span>
                <span>{sc.newPxMax} Ft ({t('drágább', 'more expensive')})</span>
              </div>

              {/* Hatás előnézet */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: t(`Eredeti X*`, 'Original X*'),
                    value: `${orig.X_star} db ${p.labelX}`,
                    color: 'text-indigo-600',
                    icon: sc.icon,
                  },
                  {
                    label: t('Becsült új X*', 'Estimated new X*'),
                    value: `${slutsky.X_new} db ${p.labelX}`,
                    color: newPx > p.Px ? 'text-red-500' : newPx < p.Px ? 'text-green-600' : 'text-slate-500',
                    icon: newPx > p.Px ? '📉' : newPx < p.Px ? '📈' : '➡️',
                  },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-lg mb-0.5">{item.icon}</div>
                    <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                    <div className={`text-xl font-black ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipp kérdések */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900">
                🧠 {t('Szerinted melyik hatás a nagyobb?', 'Which effect do you think is larger?')}
              </h2>
              <p className="text-sm text-slate-500">
                {t(
                  `A(z) ${p.labelX} ${p.Px} Ft → ${newPx} Ft. Két hatás csökkenti a(z) ${p.labelX} fogyasztást: (1) Helyettesítési hatás — a(z) ${p.labelX} relatíve drágább lett a(z) ${p.labelY}-hoz képest. (2) Jövedelemhatás — az áremelés miatt "szegényebb" lettél, kevesebbet engedhetsz meg magadnak mindenből.`,
                  `${p.labelX} ${p.Px} Ft → ${newPx} Ft. Two effects reduce ${p.labelX} consumption: (1) Substitution effect — ${p.labelX} is now relatively more expensive than ${p.labelY}. (2) Income effect — the price rise makes you "poorer", you can afford less of everything.`,
                )}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sub_bigger', label: t('Helyettesítési > jövedelmi', 'Substitution > income'), icon: '🔄' },
                  { id: 'inc_bigger', label: t('Jövedelmi > helyettesítési', 'Income > substitution'), icon: '💰' },
                  { id: 'equal', label: t('Kb. egyenlők', 'Roughly equal'), icon: '⚖️' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setGuessMode(opt.id as typeof guessMode)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      guessMode === opt.id
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-slate-200 bg-white hover:border-orange-200'
                    }`}
                  >
                    <div className="text-xl mb-1">{opt.icon}</div>
                    <div className="text-xs font-semibold text-slate-700 leading-tight">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleReveal}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-lg shadow-md"
            >
              {t('Megmutatom a Slutsky-felbontást! →', 'Show me the Slutsky decomposition! →')}
            </button>
          </>
        )}

        {/* ── REVEAL PHASE ── */}
        {phase === 'reveal' && (
          <>
            {/* Score banner */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white">
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
                {t('Helyes tipp = +500 pt | Megpróbálta = +100 pt', 'Correct guess = +500 pts | Attempted = +100 pts')}
              </p>
            </div>

            {/* Slutsky eredmény */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-6">
              <div className="text-4xl mb-2">🔬</div>
              <h2 className="text-xl font-black text-slate-900 mb-3">
                {t('Slutsky-felbontás eredménye', 'Slutsky decomposition result')}
              </h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  {
                    label: t('Teljes hatás', 'Total effect'),
                    value: `${slutsky.total_effect > 0 ? '+' : ''}${slutsky.total_effect} ${p.labelX}`,
                    sub: `${orig.X_star} → ${slutsky.X_new}`,
                    color: 'text-slate-800',
                    bg: 'bg-white',
                  },
                  {
                    label: t('Helyettesítési hatás', 'Substitution effect'),
                    value: `${slutsky.substitution_effect > 0 ? '+' : ''}${slutsky.substitution_effect} ${p.labelX}`,
                    sub: `${orig.X_star} → ${slutsky.X_slutsky}`,
                    color: 'text-blue-700',
                    bg: 'bg-blue-50',
                  },
                  {
                    label: t('Jövedelemhatás', 'Income effect'),
                    value: `${slutsky.income_effect > 0 ? '+' : ''}${slutsky.income_effect} ${p.labelX}`,
                    sub: `${slutsky.X_slutsky} → ${slutsky.X_new}`,
                    color: 'text-red-700',
                    bg: 'bg-red-50',
                  },
                ].map(item => (
                  <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center shadow-sm`}>
                    <div className="text-xs text-slate-500 mb-1 leading-tight">{item.label}</div>
                    <div className={`text-xl font-black ${item.color}`}>{item.value}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>

              {/* Ellenőrzés */}
              <div className="bg-white rounded-xl p-3 text-center border border-orange-200">
                <p className="text-sm font-bold text-slate-800">
                  {t('Ellenőrzés: helyettesítési + jövedelmi = teljes', 'Check: substitution + income = total')}
                </p>
                <p className="text-lg font-black text-orange-600 mt-1">
                  {slutsky.substitution_effect} + ({slutsky.income_effect}) = {slutsky.total_effect} ✓
                </p>
              </div>

              {guessMode && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-orange-200">
                  <p className="text-sm font-bold text-slate-700">
                    {t('A tipped:', 'Your guess:')}{' '}
                    {guessMode === 'sub_bigger' ? t('Helyettesítési > jövedelmi', 'Substitution > income')
                      : guessMode === 'inc_bigger' ? t('Jövedelmi > helyettesítési', 'Income > substitution')
                      : t('Kb. egyenlők', 'Roughly equal')}
                    {' '}→{' '}
                    {Math.abs(slutsky.substitution_effect) > Math.abs(slutsky.income_effect)
                      ? (guessMode === 'sub_bigger' ? '✅ ' + t('Igaz!', 'Correct!') : '❌ ' + t('Nem egészen.', 'Not quite.'))
                      : Math.abs(slutsky.income_effect) > Math.abs(slutsky.substitution_effect)
                      ? (guessMode === 'inc_bigger' ? '✅ ' + t('Igaz!', 'Correct!') : '❌ ' + t('Nem egészen.', 'Not quite.'))
                      : (guessMode === 'equal' ? '✅ ' + t('Pontosan!', 'Exactly!') : '❌ ' + t('Szinte egyenlők.', 'They are nearly equal.'))
                    }
                    {' '}{t(`(Cobb-Douglas alpha=${p.alpha} esetén mindkét hatás: ${Math.abs(slutsky.substitution_effect)})`, `(With Cobb-Douglas alpha=${p.alpha} both effects: ${Math.abs(slutsky.substitution_effect)})`)}
                  </p>
                </div>
              )}
            </div>

            {/* Grafikon */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {t('Grafikon — 3 budget line, 3 IC görbe, Slutsky-lépések', 'Chart — 3 budget lines, 3 IC curves, Slutsky steps')}
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                {t('Kék = eredeti, narancssárga = Slutsky-kompenzált, piros = új budget line. Pontok: A=eredeti, B=kompenzált, C=új optimum.', 'Blue = original, orange = Slutsky-compensated, red = new budget line. Points: A=original, B=compensated, C=new optimum.')}
              </p>
              <BudgetChart
                params={p}
                budgetLines={[
                  { params: p, color: '#6366f1', name: t(`Eredeti BL (Px=${p.Px})`, `Original BL (Px=${p.Px})`) },
                  { params: slutskyParams, color: '#f97316', dash: '6 3', name: t('Slutsky BL (kompenzált)', 'Slutsky BL (compensated)') },
                  { params: newParams, color: '#ef4444', name: t(`Új BL (Px=${newPx})`, `New BL (Px=${newPx})`) },
                ]}
                curves={[
                  { U: U_orig, color: '#6366f1', name: `IC₁ (U=${U_orig.toFixed(2)})` },
                  { U: U_new, color: '#ef4444', name: `IC₂ (U=${U_new.toFixed(2)})` },
                ]}
                dots={[
                  { X: slutsky.X_orig, Y: slutsky.Y_orig, color: '#6366f1', label: `A (${slutsky.X_orig}, ${slutsky.Y_orig})` },
                  { X: slutsky.X_slutsky, Y: slutsky.Y_slutsky, color: '#f97316', label: `B (${slutsky.X_slutsky}, ${slutsky.Y_slutsky})` },
                  { X: slutsky.X_new, Y: slutsky.Y_new, color: '#ef4444', label: `C (${slutsky.X_new}, ${slutsky.Y_new})` },
                ]}
                height={360}
              />
              <div className="mt-3 grid sm:grid-cols-3 gap-2">
                {[
                  { color: 'bg-indigo-500', label: t('A pont: eredeti optimum', 'Point A: original optimum'), sub: `(${slutsky.X_orig}, ${slutsky.Y_orig})` },
                  { color: 'bg-orange-500', label: t('B pont: Slutsky-kompenzált', 'Point B: Slutsky-compensated'), sub: `(${slutsky.X_slutsky}, ${slutsky.Y_slutsky}) — I=${slutsky.I_slutsky} Ft` },
                  { color: 'bg-red-500', label: t('C pont: új optimum', 'Point C: new optimum'), sub: `(${slutsky.X_new}, ${slutsky.Y_new}) — Px=${newPx} Ft` },
                ].map(item => (
                  <div key={item.label} className="flex gap-2 items-start p-2 rounded-xl bg-slate-50">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 ${item.color}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-700">{item.label}</div>
                      <div className="text-xs text-slate-500">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tábla */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {t('Szemléltető tábla — Slutsky-felbontás', 'Illustrative table — Slutsky decomposition')}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {[t('Állapot', 'State'), 'Px (Ft)', 'I (Ft)', 'X*', 'Y*', 'U*'].map(h => (
                        <th key={h} className="py-2 px-2 text-xs font-bold text-slate-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 bg-indigo-50">
                      <td className="py-2 px-2 text-left font-bold text-indigo-700">A — {t('Eredeti', 'Original')}</td>
                      <td className="py-2 px-2 font-mono">{p.Px}</td>
                      <td className="py-2 px-2 font-mono">{p.I}</td>
                      <td className="py-2 px-2 font-mono font-bold">{slutsky.X_orig}</td>
                      <td className="py-2 px-2 font-mono">{slutsky.Y_orig}</td>
                      <td className="py-2 px-2 font-mono">{slutsky.U_orig.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-slate-100 bg-orange-50">
                      <td className="py-2 px-2 text-left font-bold text-orange-700">B — {t('Slutsky-komp.', 'Slutsky-comp.')}</td>
                      <td className="py-2 px-2 font-mono">{newPx}</td>
                      <td className="py-2 px-2 font-mono text-orange-700 font-bold">{slutsky.I_slutsky}</td>
                      <td className="py-2 px-2 font-mono font-bold">{slutsky.X_slutsky}</td>
                      <td className="py-2 px-2 font-mono">{slutsky.Y_slutsky}</td>
                      <td className="py-2 px-2 font-mono">{U_slutsky.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-slate-100 bg-red-50">
                      <td className="py-2 px-2 text-left font-bold text-red-700">C — {t('Új optimum', 'New optimum')}</td>
                      <td className="py-2 px-2 font-mono text-red-700 font-bold">{newPx}</td>
                      <td className="py-2 px-2 font-mono">{p.I}</td>
                      <td className="py-2 px-2 font-mono font-bold">{slutsky.X_new}</td>
                      <td className="py-2 px-2 font-mono">{slutsky.Y_new}</td>
                      <td className="py-2 px-2 font-mono">{slutsky.U_new.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-slate-50 border-t-2 border-slate-300">
                      <td className="py-2 px-2 text-left font-bold text-slate-700" colSpan={3}>{t('Hatások', 'Effects')}</td>
                      <td className="py-2 px-2 font-mono font-bold text-blue-700">{t('Helyet.', 'Subst.')}: {slutsky.substitution_effect}</td>
                      <td className="py-2 px-2 font-mono font-bold text-red-700">{t('Jöv.', 'Inc.')}: {slutsky.income_effect}</td>
                      <td className="py-2 px-2 font-mono font-bold text-slate-800">{t('Össz.', 'Total')}: {slutsky.total_effect}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Levezetés */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2 flex-wrap">
                <span className="bg-orange-100 text-orange-800 text-xs font-mono px-2 py-1 rounded-lg border border-orange-200">
                  ΔX = ΔX_helyet + ΔX_jöv
                </span>
              </h2>
              <div className="space-y-3">
                {[
                  {
                    n: '1', color: 'bg-indigo-600',
                    lbl: t('Eredeti optimum (A pont)', 'Original optimum (point A)'),
                    formula: `X* = α·I/Px = ${p.alpha}·${p.I}/${p.Px} = ${orig.X_star}`,
                    desc: t('A kiindulópontunk.', 'Our starting point.'),
                  },
                  {
                    n: '2', color: 'bg-orange-500',
                    lbl: t('Slutsky-kompenzált jövedelem', 'Slutsky-compensated income'),
                    formula: `I_s = Px_új · X* + Py · Y* = ${newPx}·${orig.X_star} + ${p.Py}·${orig.Y_star} = ${slutsky.I_slutsky} Ft`,
                    desc: t('Annyit kapunk kompenzációként, hogy az eredeti kosarat meg tudjuk venni az új áron.', 'Compensated so we can still afford the original basket at the new price.'),
                  },
                  {
                    n: '3', color: 'bg-orange-500',
                    lbl: t('Kompenzált optimum (B pont) — helyettesítési hatás', 'Compensated optimum (B) — substitution effect'),
                    formula: `X_s = α·I_s/Px_új = ${p.alpha}·${slutsky.I_slutsky}/${newPx} = ${slutsky.X_slutsky}`,
                    desc: t(`Helyettesítési hatás = X_s - X* = ${slutsky.X_slutsky} - ${orig.X_star} = ${slutsky.substitution_effect}. Csak az árváltozás hatása, rögzített vásárlóerőnél.`,
                             `Substitution effect = X_s - X* = ${slutsky.X_slutsky} - ${orig.X_star} = ${slutsky.substitution_effect}. Pure price effect at constant purchasing power.`),
                  },
                  {
                    n: '4', color: 'bg-red-500',
                    lbl: t('Új optimum (C pont) — jövedelemhatás', 'New optimum (C) — income effect'),
                    formula: `X_új = α·I/Px_új = ${p.alpha}·${p.I}/${newPx} = ${slutsky.X_new}`,
                    desc: t(`Jövedelemhatás = X_új - X_s = ${slutsky.X_new} - ${slutsky.X_slutsky} = ${slutsky.income_effect}. Az áremelés "szegényebbé" tett, kevesebbet veszünk mindenből.`,
                             `Income effect = X_new - X_s = ${slutsky.X_new} - ${slutsky.X_slutsky} = ${slutsky.income_effect}. The price rise made us "poorer", we buy less of everything.`),
                  },
                ].map(s => (
                  <div key={s.n} className="flex gap-3 items-start">
                    <div className={`w-6 h-6 rounded-full ${s.color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>{s.n}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs font-semibold text-slate-500">{s.lbl}:</span>
                        <code className="text-xs font-mono font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 break-all">{s.formula}</code>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tanulság */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-6">
              <h3 className="font-black text-orange-900 text-lg mb-4">💡 {t('Tanulság', 'Key takeaway')}</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-xl p-4 border border-orange-100">
                  <h4 className="font-bold text-slate-900 mb-1.5">🔄 {t('Miért két különböző hatás?', 'Why two distinct effects?')}</h4>
                  <p className="text-slate-700">
                    {t(
                      `Ha a(z) ${p.labelX} drágul, két dolog történik egyidejűleg: (1) A(z) ${p.labelX} relatíve drágul a(z) ${p.labelY}-hoz képest — ezért a(z) ${p.labelY} felé "tolsz" (helyettesítési hatás). (2) Reáljövedelmed csökken — az ${p.I} Ft most kevesebbet ér, mintha szegényebb lettél volna (jövedelemhatás). A Slutsky-felbontás szétválasztja ezt a kettőt.`,
                      `When ${p.labelX} gets more expensive, two things happen simultaneously: (1) ${p.labelX} becomes relatively more expensive than ${p.labelY} — so you shift toward ${p.labelY} (substitution effect). (2) Your real income falls — ${p.I} Ft now buys less, as if you got poorer (income effect). The Slutsky decomposition separates these two.`,
                    )}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-white rounded-xl border border-orange-100">
                    <div className="text-xs font-bold text-orange-700 mb-1.5">⛽ {t('Valós példa', 'Real example')}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t(
                        'Benzin ára megduplázódik. Helyettesítési hatás: buszra váltasz. Jövedelemhatás: az egész havi keretedből marad kevesebb — kevesebbet vacsorázol ki, kevesebb moziba jársz. Mindkettő csökkenti a benzinkeresletet.',
                        'Petrol price doubles. Substitution effect: you switch to the bus. Income effect: your whole monthly budget shrinks — you eat out less, go to the cinema less. Both reduce petrol demand.',
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-orange-100">
                    <div className="text-xs font-bold text-orange-700 mb-1.5">🥔 {t('Giffen-jószág (bővítmény)', 'Giffen good (extension)')}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t(
                        'Ha a jövedelemhatás nagyobb, mint a helyettesítési hatás, és ellentétes irányú — a kereslet NŐ az áremeléssel (Giffen-jószág, pl. 19. sz. burgonyaéhség). Extrém ritka jelenség, de jogilag lehetséges.',
                        'If the income effect outweighs the substitution effect and goes the opposite direction, demand RISES with price (Giffen good, e.g. 19th-c. potato famine). An extremely rare but theoretically possible phenomenon.',
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            
            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('4. szint (FE)', 'Level 4 (BC)')}</h2>
              <Leaderboard level={16} refreshKey={leaderboardKey} />
            </div>

            {/* Navigáció */}
            <div className="flex gap-3">
              <button
                onClick={() => { setPhase('try'); setPlayerGuessX(null); setGuessMode(null) }}
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm"
              >
                {t('← Próbálom újra', '← Try again')}
              </button>
              <Link
                to="/dashboard"
                className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md"
              >
                {t('← Vissza a játékokhoz', '← Back to games')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
