/**
 * 2. szint — Közömbösségi görbék
 * Productive failure: a játékos az X+Y összeget, vagy az egyik jószág mennyiségét
 * nézi rangsoroláshoz — de A és B azonos hasznosságon vannak, hiába van B-nek több összesen!
 * Ritmus: csinálja → leleplezés → miért
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { submitScore, calcTimeBonus } from '../../lib/scores'
import GameTimer from '../GameTimer'
import {
  LEVEL2_BASKETS,
  utilityAt,
  mrsAt,
} from '../../engine/budget-constraint'
import { BC_SCENARIOS, pickBCRandom } from '../../engine/bc-scenarios'
import BudgetChart from './charts/BudgetChart'
import NotationBox from '../NotationBox'
import Leaderboard from '../Leaderboard'

type Phase = 'try' | 'reveal'

const TOTAL_SECONDS = 120

export default function BCLevel2() {
  const { t } = useI18n()
  const { session } = useAuth()
  const [sc] = useState(() => pickBCRandom(BC_SCENARIOS))
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const p = sc.params
  const [phase, setPhase] = useState<Phase>('try')
  const [ranking, setRanking] = useState<string[]>([])
  const [timerRunning, setTimerRunning] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_SECONDS)
  const [scored, setScored] = useState(false)

  const baskets = LEVEL2_BASKETS

  // Basket descriptions using scenario labels
  const BASKET_INFO = [
    { id: 'A', desc: t(`Kevés ${sc.params.labelX}, sok ${sc.params.labelY}`, `Few ${sc.params.labelX}, lots of ${sc.params.labelY}`), hint: t(`Több ${sc.params.labelY}`, `More ${sc.params.labelY}`) },
    { id: 'B', desc: t(`Sok ${sc.params.labelX}, kevés ${sc.params.labelY}`, `Lots of ${sc.params.labelX}, few ${sc.params.labelY}`), hint: t(`Több ${sc.params.labelX}`, `More ${sc.params.labelX}`) },
    { id: 'C', desc: t('Kiegyensúlyozott', 'Balanced'), hint: t('Közepes mindkettőből', 'Medium of both') },
    { id: 'D', desc: t('Mindkettőből kevés', 'Few of both'), hint: t('Kis kosár', 'Small basket') },
  ]

  const handleRankClick = (id: string) => {
    setRanking(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      return [...prev, id]
    })
  }

  const isComplete = ranking.length === 4

  const U_C = utilityAt(p, 8, 6)
  const U_AB = utilityAt(p, 4, 9)
  const U_D = utilityAt(p, 2, 5)

  const calcScore = (r: string[], tb: number) => {
    let ap = 0
    if (r[0] === 'C') ap += 300
    const aIdx = r.indexOf('A')
    const bIdx = r.indexOf('B')
    if (aIdx >= 0 && bIdx >= 0 && Math.abs(aIdx - bIdx) === 1) ap += 200
    return { ap, total: ap + tb }
  }

  const tb = calcTimeBonus(timeRemaining, TOTAL_SECONDS)
  const { ap, total } = calcScore(ranking, tb)

  const handleTimerTick = (r: number) => setTimeRemaining(r)
  const handleTimerExpire = () => setTimerRunning(false)

  const handleReveal = () => {
    setTimerRunning(false)
    setPhase('reveal')
    const tbNow = calcTimeBonus(timeRemaining, TOTAL_SECONDS)
    const { ap: apNow, total: totalNow } = calcScore(ranking, tbNow)
    if (session && !scored) {
      setScored(true)
      submitScore({
        user_id: session.user.id,
        user_email: session.user.email!,
        level: 14,
        score: totalNow,
        accuracy_points: apNow,
        time_bonus: tbNow,
        quiz_points: 0,
        time_taken_seconds: TOTAL_SECONDS - timeRemaining,
        scenario_id: `bc-l2-${sc.id}`,
      }).then(() => setLeaderboardKey(k => k + 1))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-0.5">
              <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">← Dashboard</Link>
              <span>›</span>
              <Link to="/games/budget-constraint" className="hover:text-indigo-600 transition-colors">
                {t('Fogyasztáselmélet', 'Consumer Theory')}
              </Link>
              <span>›</span>
              <span className="text-slate-700 font-semibold">2. {t('Közömbösségi görbék', 'Indifference Curves')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {t('Melyik kosár a legjobb?', 'Which basket is the best?')}
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
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                    n === 2
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-purple-300 hover:text-purple-600'
                  }`}>{n}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        <NotationBox notations={[
          { symbol: 'IC', full: 'Közömbösségi görbe (Indifference Curve)', altSymbols: 'U-görbe, izohasznosság' },
          { symbol: 'U', full: 'Hasznosság (Utility)', altSymbols: 'u, TU (total utility)' },
          { symbol: 'U = X^α · Y^(1−α)', full: 'Cobb-Douglas hasznosság', note: 'α = preferencia-súly X-re' },
          { symbol: 'MRS', full: 'Helyettesítési határráta (Marginal Rate of Substitution)', formula: 'MRS = ΔY/ΔX (IC mentén)', altSymbols: 'MRS_xy, helyettesítési ráta' },
        ]} />

        {/* Szituáció */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-6">
          <div className="flex gap-4">
            <div className="text-4xl flex-shrink-0">{sc.icon}</div>
            <div>
              <h2 className="font-bold text-slate-900 text-base mb-1">
                {t('4 vásárlási lehetőség', '4 shopping options')}
              </h2>
              <p className="text-slate-700 leading-relaxed text-sm">
                {t(
                  `Alább 4 kosár látható — mindegyikben más arányban van ${p.labelX} (${p.Px} Ft) és ${p.labelY} (${p.Py} Ft). Rangsorold őket a legjobbtól a legrosszabbig!`,
                  `Below are 4 baskets — each with a different mix of ${p.labelX} (${p.Px} Ft) and ${p.labelY} (${p.Py} Ft). Rank them from best to worst!`,
                )}
              </p>
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-semibold text-amber-900">
                  🎯 {t(`Csapda: Melyik a jobb — A(4 ${p.labelX}, 9 ${p.labelY}) vagy B(12 ${p.labelX}, 3 ${p.labelY})?`, `Trap: Which is better — A(4 ${p.labelX}, 9 ${p.labelY}) or B(12 ${p.labelX}, 3 ${p.labelY})?`)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── TRY PHASE ── */}
        {phase === 'try' && (
          <>
            {/* Kosarak megjelenítése */}
            <div className="grid grid-cols-2 gap-3">
              {baskets.map((b, i) => {
                const info = BASKET_INFO[i]
                const rankPos = ranking.indexOf(b.id)
                const isRanked = rankPos >= 0
                return (
                  <button
                    key={b.id}
                    onClick={() => handleRankClick(b.id)}
                    className={`rounded-2xl border-2 p-4 text-left transition-all ${
                      isRanked
                        ? 'border-purple-400 bg-purple-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{b.emoji}</span>
                        <span className="font-bold text-slate-900 text-base">{b.label}</span>
                      </div>
                      {isRanked && (
                        <span className="w-6 h-6 bg-purple-600 text-white rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {rankPos + 1}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{sc.icon} {t(`${p.labelX} (X)`, `${p.labelX} (X)`)}</span>
                        <span className="font-bold text-slate-800">{b.X} db</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">🛒 {t(`${p.labelY} (Y)`, `${p.labelY} (Y)`)}</span>
                        <span className="font-bold text-slate-800">{b.Y} db</span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-slate-100 pt-1 mt-1">
                        <span className="text-slate-500">{t('Összes db', 'Total units')}</span>
                        <span className="font-bold text-slate-600">{b.X + b.Y} db</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 italic">{info.desc}</p>
                  </button>
                )
              })}
            </div>

            {ranking.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  {t('Az eddigi sorrendünk (legjobbtól legrosszabbig):', 'Your current ranking (best to worst):')}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {ranking.map((id, i) => {
                    const b = baskets.find(x => x.id === id)!
                    return (
                      <div key={id} className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5">
                        <span className="w-4 h-4 bg-purple-600 text-white rounded-full text-xs font-bold flex items-center justify-center">{i+1}</span>
                        <span className="text-sm font-bold text-purple-900">{b.emoji} {b.label}</span>
                      </div>
                    )
                  })}
                </div>
                {ranking.length < 4 && (
                  <p className="text-xs text-slate-400 mt-2">{t(`Még ${4 - ranking.length} kosár kell a teljes sorrendhez.`, `${4 - ranking.length} more basket(s) needed for a complete ranking.`)}</p>
                )}
              </div>
            )}

            <button
              disabled={!isComplete}
              onClick={handleReveal}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors text-lg shadow-md disabled:cursor-not-allowed"
            >
              {isComplete
                ? t('Megmutatom a megoldást! →', 'Show me the solution! →')
                : t(`Válassz mind a 4 kosarat! (${ranking.length}/4)`, `Select all 4 baskets! (${ranking.length}/4)`)}
            </button>
          </>
        )}

        {/* ── REVEAL PHASE ── */}
        {phase === 'reveal' && (
          <>
            {/* Score banner */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-5 text-white">
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
                {t('C legjobb = +300 pt | A és B szomszédos = +200 pt', 'C ranked first = +300 pts | A and B adjacent = +200 pts')}
              </p>
            </div>

            {/* Eredmény banner */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-6">
              <div className="text-4xl mb-2">🎯</div>
              <h2 className="text-xl font-black text-slate-900 mb-3">
                {t('A nagy meglepetés: A és B UGYANOLYAN jó!', 'The big reveal: A and B are EQUALLY good!')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {baskets.map(b => {
                  const U = utilityAt(p, b.X, b.Y)
                  const playerRank = ranking.indexOf(b.id) + 1
                  return (
                    <div key={b.id} className="bg-white rounded-xl p-3 text-center shadow-sm">
                      <div className="text-xl mb-1">{b.emoji}</div>
                      <div className="font-bold text-slate-800">{b.label}</div>
                      <div className="text-xs text-slate-500 mt-1">U = {U.toFixed(2)}</div>
                      <div className="text-xs text-slate-500">{b.X}+{b.Y}={b.X+b.Y} db</div>
                      <div className="mt-2 text-xs">
                        <span className="text-slate-400">{t('Te:', 'You:')} </span>
                        <span className="font-bold text-purple-700">{playerRank}. hely</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-sm font-bold text-amber-900">
                  ⚠️ {t('B-nek 15 db van (4+12+... = 15), A-nak csak 13 — mégis U(A) = U(B) = 6.00!', 'B has 15 total units, A only 13 — yet U(A) = U(B) = 6.00!')}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {t('Az összes darabszám nem méri a hasznosságot. Csak a szubjektív preferencia számít.', 'Total quantity does not measure utility. Only subjective preferences matter.')}
                </p>
              </div>
            </div>

            {/* IC térkép grafikon */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {t('IC térkép — közömbösségi görbe-rendszer', 'IC map — indifference curve system')}
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                {t('Minden görbe azonos hasznosságú pontok mértani helye. A és B UGYANAZON a görbén van!', 'Each curve is the locus of equally-preferred bundles. A and B are on the SAME curve!')}
              </p>
              <BudgetChart
                params={p}
                budgetLines={[]}
                curves={[
                  { U: U_D,  color: '#94a3b8', name: `IC_D (U≈${U_D.toFixed(2)})` },
                  { U: U_AB, color: '#a855f7', name: `IC_A=B (U=${U_AB.toFixed(2)})` },
                  { U: U_C,  color: '#10b981', name: `IC_C (U≈${U_C.toFixed(2)})` },
                ]}
                dots={[
                  { X: baskets[0].X, Y: baskets[0].Y, color: '#a855f7', label: 'A' },
                  { X: baskets[1].X, Y: baskets[1].Y, color: '#a855f7', label: 'B' },
                  { X: baskets[2].X, Y: baskets[2].Y, color: '#10b981', label: 'C' },
                  { X: baskets[3].X, Y: baskets[3].Y, color: '#94a3b8', label: 'D' },
                ]}
              />
              <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-purple-900">
                  {t('Magasabb IC görbe = magasabb hasznosság. C egy jobb görbén van, mint A és B. D a legalsón.', 'Higher IC curve = higher utility. C is on a better curve than A and B. D is on the lowest.')}
                </p>
              </div>
            </div>

            {/* Táblázat */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {t('Szemléltető tábla — U és MRS összehasonlítás', 'Illustrative table — U and MRS comparison')}
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                U(X,Y) = √(X·Y), MRS = Y/X {t('(alpha=0.5 esetén)', '(for alpha=0.5)')}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 px-3 text-left text-xs font-bold text-slate-500 uppercase">{t('Kosár', 'Basket')}</th>
                      <th className="py-2 px-3 text-xs font-bold text-slate-500 uppercase">X ({p.labelX})</th>
                      <th className="py-2 px-3 text-xs font-bold text-slate-500 uppercase">Y ({p.labelY})</th>
                      <th className="py-2 px-3 text-xs font-bold text-slate-500 uppercase">X+Y</th>
                      <th className="py-2 px-3 text-xs font-bold text-slate-500 uppercase">U = √(X·Y)</th>
                      <th className="py-2 px-3 text-xs font-bold text-slate-500 uppercase">MRS = Y/X</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...baskets].map(b => {
                      const U = utilityAt(p, b.X, b.Y)
                      const MRS = mrsAt(p, b.X, b.Y)
                      const isTop = b.id === 'C'
                      const isTied = b.id === 'A' || b.id === 'B'
                      return (
                        <tr key={b.id} className={`border-b border-slate-100 ${isTop ? 'bg-emerald-50' : isTied ? 'bg-purple-50' : ''}`}>
                          <td className="py-2 px-3 text-left font-bold text-slate-800">{b.emoji} {b.label}</td>
                          <td className="py-2 px-3 font-mono">{b.X}</td>
                          <td className="py-2 px-3 font-mono">{b.Y}</td>
                          <td className="py-2 px-3 font-mono text-slate-500">{b.X+b.Y}</td>
                          <td className={`py-2 px-3 font-mono font-bold ${isTop ? 'text-emerald-700' : isTied ? 'text-purple-700' : 'text-slate-500'}`}>
                            {U.toFixed(2)}
                            {isTied && <span className="ml-1 text-xs">← egyforma!</span>}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600">{MRS.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tanulság */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-6">
              <h3 className="font-black text-purple-900 text-lg mb-4">💡 {t('Tanulság', 'Key takeaway')}</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <h4 className="font-bold text-slate-900 mb-1.5">🌀 {t('Miért domború a görbe?', 'Why is the curve convex?')}</h4>
                  <p className="text-slate-700">
                    {t(
                      `Az A kosárban (4 ${p.labelX}, 9 ${p.labelY}) a MRS=9/4=2.25 — van sok ${p.labelY}-d, ezért szívesen adnál 2+ ${p.labelY}-t 1 ${p.labelX}-ért. B kosárban (12 ${p.labelX}, 3 ${p.labelY}) MRS=0.25 — van sok ${p.labelX}-d, már csak 0.25 ${p.labelY}-t adnál 1 ${p.labelX}-ért. Ez a csökkenő MRS.`,
                      `In basket A (4 ${p.labelX}, 9 ${p.labelY}) MRS=9/4=2.25 — you have lots of ${p.labelY}, so you would give up 2+ ${p.labelY} for 1 more ${p.labelX}. In B (12 ${p.labelX}, 3 ${p.labelY}) MRS=0.25 — you have lots of ${p.labelX}, you would only give up 0.25 ${p.labelY} for more ${p.labelX}. This is diminishing MRS.`,
                    )}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <h4 className="font-bold text-slate-900 mb-1.5">🚫 {t('IC görbék soha nem metszik egymást!', 'IC curves never cross!')}</h4>
                  <p className="text-slate-700">
                    {t(
                      'Ha két IC keresztezte egymást, az azt jelentené, hogy egy pont egyszerre "jobban jó" és "ugyanolyan jó" — ez logikai ellentmondás. Ezért a preferenciák konzisztensek.',
                      'If two ICs crossed, a single point would be both "better than" and "as good as" another — a logical contradiction. This is why preferences are consistent.',
                    )}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-white rounded-xl border border-purple-100">
                    <div className="text-xs font-bold text-purple-700 mb-1.5">🍕 {t('Valós példa', 'Real example')}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t(
                        '5 szelet pizza + 1 üdítő vs. 2 szelet pizza + 4 üdítő — sokan ugyanolyan boldogak lennének mindkettővel. Ez a közömbösség. Az IC megmutatja az összes ilyen kombinációt.',
                        '5 pizza slices + 1 soda vs. 2 pizza slices + 4 sodas — many people would be equally happy with both. That is indifference. The IC shows all such combinations.',
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-purple-100">
                    <div className="text-xs font-bold text-purple-700 mb-1.5">📐 {t('Matematikailag', 'Mathematically')}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t(
                        'U(X,Y) = X^α · Y^(1−α). Ha U = állandó, akkor Y = (U/X^α)^(1/(1−α)) — egy domború hiperbola az X-Y térben. Minél nagyobb U, annál feljebb van a görbe.',
                        'U(X,Y) = X^α · Y^(1−α). If U = constant, then Y = (U/X^α)^(1/(1−α)) — a convex hyperbola in X-Y space. Larger U means a higher curve.',
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            
            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('2. szint (FE)', 'Level 2 (BC)')}</h2>
              <Leaderboard level={14} refreshKey={leaderboardKey} />
            </div>

            {/* Navigáció */}
            <div className="flex gap-3">
              <button
                onClick={() => { setPhase('try'); setRanking([]) }}
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm"
              >
                {t('← Próbálom újra', '← Try again')}
              </button>
              <Link
                to="/games/budget-constraint/level/3"
                className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md"
              >
                {t('3. szint — Fogyasztói optimum →', 'Level 3 — Consumer Optimum →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
