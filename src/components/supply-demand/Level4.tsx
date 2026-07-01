import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { solveTax, solveEquilibrium, solvePriceCeiling } from '../../engine/supply-demand'
import { SD_LEVEL4_QUIZ, pickQuestions } from '../../engine/supply-demand-quiz'
import { SD_LEVEL4_SCENARIOS, pickSDRandom } from '../../engine/supply-demand-scenarios'
import { submitScore, calcTimeBonus } from '../../lib/scores'
import SupplyDemandChart from './charts/SupplyDemandChart'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import NotationBox from '../NotationBox'
import Leaderboard from '../Leaderboard'

type Phase = 'try' | 'quiz' | 'reveal'

const TOTAL_SECONDS = 120

function calcAccuracyInline(playerTax: number, optimalTax: number): number {
  const diff = Math.abs(playerTax - optimalTax)
  if (diff === 0) return 200
  if (diff <= 5) return 160
  if (diff <= 10) return 120
  if (diff <= 20) return 80
  return 40
}

export default function SDLevel4() {
  const { t } = useI18n()
  const { session } = useAuth()

  const [sc] = useState(() => pickSDRandom(SD_LEVEL4_SCENARIOS))
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const PARAMS = sc.params

  const [phase, setPhase] = useState<Phase>('try')
  const [tax, setTax] = useState(sc.defaultTax)
  const [submittedTax, setSubmittedTax] = useState(sc.defaultTax)
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(SD_LEVEL4_QUIZ, 3))

  const [accuracyPoints, setAccuracyPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const result = solveTax(PARAMS, tax)

  const { A, Bd, C, Bs } = PARAMS
  const demandLabel = `P = ${A} − ${Bd === 1 ? '' : Bd}Q`
  const supplyLabel = `P = ${C} + ${Bs === 1 ? '' : Bs}Q`

  const handleTimerTick = (remaining: number) => {
    secondsRemainingRef.current = remaining
  }

  const handleTimerExpire = () => {
    setTimerRunning(false)
    if (phase === 'try') setPhase('quiz')
    else if (phase === 'quiz') finishQuiz(0)
  }

  const handleSubmit = () => {
    setSubmittedTax(tax)
    setPhase('quiz')
  }

  const finishQuiz = (correctCount: number) => {
    setTimerRunning(false)
    const ap = calcAccuracyInline(submittedTax, sc.defaultTax)
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
        level: 8,
        score: total,
        accuracy_points: ap,
        time_bonus: tb,
        quiz_points: qp,
        time_taken_seconds: TOTAL_SECONDS - secondsRemainingRef.current,
        scenario_id: sc.id,
      }).then(() => setLeaderboardKey(k => k + 1)).catch(() => {})
    }

    setPhase('reveal')
  }

  // For summary table
  const eq = solveEquilibrium(PARAMS)
  const shiftedEq = solveEquilibrium({ ...PARAMS, A: PARAMS.A + 15 })
  const ceil = solvePriceCeiling(PARAMS, Math.round(sc.eqP * 0.67))
  const taxDefault = solveTax(PARAMS, sc.defaultTax)

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
              <span className="text-slate-700 font-semibold">4. {t('Adó és Jólét', 'Tax & Welfare')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {t('Ki viseli az adó terhét? Mekkora a DWL?', 'Who bears the tax burden? How large is the DWL?')}
            </h1>
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
              <Link to="/games/supply-demand/level/1" className="w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">1</Link>
              <Link to="/games/supply-demand/level/2" className="w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">2</Link>
              <Link to="/games/supply-demand/level/3" className="w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">3</Link>
              <Link to="/games/supply-demand/level/4" className="w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-indigo-600 text-white shadow-sm">4</Link>
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

        {/* ── TRY PHASE ── */}
        {phase === 'try' && (
          <>
            {/* Story card */}
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-6">
              <div className="flex gap-4">
                <div className="text-4xl flex-shrink-0">{sc.icon}</div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base mb-1">
                    {t(sc.titleHu, sc.titleEn)}
                  </h2>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {t(sc.storyHu, sc.storyEn)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs bg-white border border-violet-200 text-violet-700 px-2 py-1 rounded-lg font-semibold">
                      {t('Kereslet', 'Demand')}: {demandLabel}
                    </span>
                    <span className="text-xs bg-white border border-violet-200 text-violet-700 px-2 py-1 rounded-lg font-semibold">
                      {t('Kínálat', 'Supply')}: {supplyLabel}
                    </span>
                    <span className="text-xs bg-white border border-violet-200 text-violet-700 px-2 py-1 rounded-lg font-semibold">
                      {t(`Egyensúly: P*=${sc.eqP}, Q*=${sc.eqQ}`, `Equilibrium: P*=${sc.eqP}, Q*=${sc.eqQ}`)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax slider */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-slate-600 mb-4">
                {t(
                  'Kísérletezz az adó mértékével! Figyeld, ahogy az adóbevétel és a DWL változik. Állítsd be azt az adókulcsot, amellyel szerinted a legjobb egyensúlyt éred el adóbevétel és holtteher között!',
                  'Experiment with the tax rate! Watch how tax revenue and DWL change. Set the tax rate that you think achieves the best balance between revenue and deadweight loss!'
                )}
              </p>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-800">{t('Adó mértéke (t):', 'Tax rate (t):')} </h2>
                <div className="text-right">
                  <span className="text-4xl font-black text-violet-600">{tax}</span>
                  <span className="text-lg font-semibold text-slate-400 ml-1">{t('egység', 'per unit')}</span>
                </div>
              </div>
              <input
                type="range" min={sc.taxMin} max={sc.taxMax} step={5} value={tax}
                onChange={e => setTax(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-violet-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>{sc.taxMin} {t('(nincs adó)', '(no tax)')}</span>
                <span>{sc.taxMax} {t('(magas)', '(high)')}</span>
              </div>

              {/* Stat cards */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: t('P vevő (P_buyer)', 'P buyer'), value: result.P_buyer, color: 'text-violet-700' },
                  { label: t('P eladó (P_seller)', 'P seller'), value: result.P_seller, color: 'text-cyan-700' },
                  { label: 'Q', value: result.Q, color: 'text-slate-800' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                    <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  { label: 'CS', value: result.CS, color: 'text-indigo-700', sub: t('Fogyasztói többlet', 'Consumer surplus') },
                  { label: 'PS', value: result.PS, color: 'text-emerald-700', sub: t('Termelői többlet', 'Producer surplus') },
                  { label: t('Adóbevétel', 'Tax revenue'), value: result.tax_revenue, color: 'text-amber-700', sub: `t × Q = ${tax} × ${result.Q}` },
                  { label: 'DWL', value: result.DWL, color: 'text-red-600', sub: t('Holtteher-veszteség', 'Deadweight loss') },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="text-xs text-slate-500">{item.label}</div>
                      <div className={`text-xl font-black ${item.color}`}>{item.value}</div>
                    </div>
                    <div className="text-xs text-slate-400">{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-3">{t('Élő grafikon', 'Live chart')}</h2>
              <SupplyDemandChart
                A={PARAMS.A} Bd={PARAMS.Bd} C={PARAMS.C} Bs={PARAMS.Bs}
                showEquilibrium
                taxBuyerPrice={tax > 0 ? result.P_buyer : undefined}
                taxSellerPrice={tax > 0 ? result.P_seller : undefined}
              />
            </div>

            {/* Tax burden note */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-3">
                ⚖️ {t('Ki viseli az adó terhét?', 'Who bears the tax burden?')}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                  <div className="text-xs font-bold text-violet-700 mb-1">{t('Vevő terhe (buyer burden)', 'Buyer burden')}</div>
                  <div className="text-2xl font-black text-violet-700">{result.buyer_burden}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    P_buyer − P* = {result.P_buyer} − {eq.P} = {result.buyer_burden}
                  </div>
                </div>
                <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                  <div className="text-xs font-bold text-cyan-700 mb-1">{t('Eladó terhe (seller burden)', 'Seller burden')}</div>
                  <div className="text-2xl font-black text-cyan-700">{result.seller_burden}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    P* − P_seller = {eq.P} − {result.P_seller} = {result.seller_burden}
                  </div>
                </div>
              </div>
              {tax > 0 && (
                <div className="mt-3 bg-slate-50 rounded-xl px-4 py-2.5 text-xs text-slate-600">
                  💡 {t(
                    `Ebben a modellben kereslet és kínálat meredeksége azonos, ezért az adóteher pontosan 50-50%-ban oszlik meg. Vevő: ${result.buyer_burden}, eladó: ${result.seller_burden} (össz: ${result.buyer_burden + result.seller_burden} = t = ${tax}).`,
                    `In this model, demand and supply have equal slopes, so the tax burden is split exactly 50-50. Buyer: ${result.buyer_burden}, seller: ${result.seller_burden} (total: ${result.buyer_burden + result.seller_burden} = t = ${tax}).`
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-lg shadow-md hover:shadow-lg"
            >
              {t('Beküldöm! →', 'Submit! →')}
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

            {/* Chart with player's tax */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {t(`Grafikon — adó t=${submittedTax}`, `Chart — tax t=${submittedTax}`)}
              </h2>
              <SupplyDemandChart
                A={PARAMS.A} Bd={PARAMS.Bd} C={PARAMS.C} Bs={PARAMS.Bs}
                showEquilibrium showCS showPS showDWL
                taxBuyerPrice={submittedTax > 0 ? solveTax(PARAMS, submittedTax).P_buyer : undefined}
                taxSellerPrice={submittedTax > 0 ? solveTax(PARAMS, submittedTax).P_seller : undefined}
              />
            </div>

            {/* Bonus scenario */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h2 className="font-bold text-amber-900 mb-2">
                🔥 {t('Bónusz: Mi történik extrém magas adónál?', 'Bonus: What happens at an extreme tax?')}
              </h2>
              <p className="text-sm text-amber-800">
                {t(sc.bonusTaxHu, sc.bonusTaxEn)}
              </p>
            </div>

            {/* Big summary table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {t('A négy eset összehasonlítása', 'Comparing all four cases')}
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                {t('L1–L4 szintek eredményei ugyanazon piac különböző állapotaiban.', 'Results from levels L1–L4 for the same market in different states.')}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50">
                      <th className="text-left py-2 px-2 font-bold text-slate-600">{t('Eset', 'Case')}</th>
                      <th className="text-center py-2 px-2 font-bold text-slate-600">Q</th>
                      <th className="text-center py-2 px-2 font-bold text-slate-600">{t('P vevő', 'P buyer')}</th>
                      <th className="text-center py-2 px-2 font-bold text-slate-600">{t('P eladó', 'P seller')}</th>
                      <th className="text-center py-2 px-2 font-bold text-slate-600">CS</th>
                      <th className="text-center py-2 px-2 font-bold text-slate-600">PS</th>
                      <th className="text-center py-2 px-2 font-bold text-slate-600">{t('Adóbev.', 'Tax rev.')}</th>
                      <th className="text-center py-2 px-2 font-bold text-slate-600">DWL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        label: t('Versenyegyensúly (L1)', 'Competitive Eq. (L1)'),
                        Q: eq.Q, Pbuyer: eq.P, Pseller: eq.P,
                        CS: eq.CS, PS: eq.PS, taxRev: '—', DWL: 0,
                        highlight: false,
                      },
                      {
                        label: t('Eltolódás (L2)', 'Shift (L2)'),
                        Q: shiftedEq.Q, Pbuyer: shiftedEq.P, Pseller: shiftedEq.P,
                        CS: shiftedEq.CS, PS: shiftedEq.PS, taxRev: '—', DWL: 0,
                        highlight: false,
                      },
                      {
                        label: t(`Árplafon (L3)`, `Ceiling (L3)`),
                        Q: ceil.Q_traded, Pbuyer: ceil.P_control, Pseller: ceil.P_control,
                        CS: ceil.CS, PS: ceil.PS, taxRev: '—', DWL: ceil.DWL,
                        highlight: false,
                      },
                      {
                        label: t(`Adó t=${submittedTax} (L4)`, `Tax t=${submittedTax} (L4)`),
                        Q: taxDefault.Q, Pbuyer: taxDefault.P_buyer, Pseller: taxDefault.P_seller,
                        CS: taxDefault.CS, PS: taxDefault.PS, taxRev: taxDefault.tax_revenue, DWL: taxDefault.DWL,
                        highlight: true,
                      },
                    ].map(row => (
                      <tr key={row.label} className={`border-b border-slate-100 ${row.highlight ? 'bg-violet-50' : ''}`}>
                        <td className={`py-2.5 px-2 font-medium ${row.highlight ? 'text-violet-800 font-bold' : 'text-slate-600'}`}>
                          {row.label}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-700">{row.Q}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-700">{row.Pbuyer}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-700">{row.Pseller}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-indigo-700">{row.CS}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-emerald-700">{row.PS}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-amber-700">{row.taxRev}</td>
                        <td className={`py-2.5 px-2 text-center font-mono font-bold ${Number(row.DWL) > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                          {row.DWL}
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
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <h4 className="font-bold text-slate-900 mb-1.5">⚖️ {t('Adóteher és rugalmasság', 'Tax burden and elasticity')}</h4>
                  <p className="text-slate-700 leading-relaxed">
                    {t(
                      'Az adó terhét nem az fizeti, akire kivetik — a relatív rugalmasság határozza meg a tehermegoszlást. Ebben a modellben a kereslet és kínálat azonos meredekségű, ezért az adó fele-fele arányban oszlik meg. Adóbevétel keletkezik, de a DWL el nem kerülhető.',
                      'Who pays the tax is not who bears the burden — relative elasticity determines the split. In this model demand and supply have equal slopes, so the tax is split equally. Tax revenue is generated, but DWL is unavoidable.'
                    )}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <div className="text-xs font-bold text-indigo-700 mb-1.5">🚬 {t('Valós példa', 'Real example')}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t(
                      'Cigarettaadó: a kereslet rugalmatlan (nehéz abbahagyni) → a vevők viselik a terhet. ÁFA rugalmas keresletű termékeknél: az eladók szívják fel. Az adórendszer tervezésekor a rugalmasság dönt.',
                      'Cigarette tax: demand is inelastic (hard to quit) → buyers bear the burden. VAT on elastic-demand goods: sellers absorb it. Elasticity is key when designing tax policy.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Congratulations */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                {t('Gratulálunk!', 'Congratulations!')}
              </h2>
              <p className="text-slate-600 mb-4">
                {t(
                  'Teljesítetted a Kereslet-kínálat játékot! Megismerted az egyensúlyt, az eltolódásokat, az árszabályozást és az adók jóléti hatásait.',
                  "You've completed the Supply & Demand game! You explored equilibrium, shifts, price controls, and the welfare effects of taxes."
                )}
              </p>
              <div className="inline-block bg-white rounded-xl px-5 py-3 shadow-sm border border-emerald-200 mb-5">
                <div className="text-xs text-slate-500 mb-1">{t('Végső pontszámod', 'Your final score')}</div>
                <div className="text-4xl font-black text-emerald-600">{totalScore}</div>
              </div>
              <div>
                <Link
                  to="/dashboard"
                  className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-md"
                >
                  {t('← Vissza a játékokhoz', '← Back to Games')}
                </Link>
              </div>
            </div>

            
            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('4. szint (SD)', 'Level 4 (SD)')}</h2>
              <Leaderboard level={8} refreshKey={leaderboardKey} />
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Link to="/games/supply-demand/level/3"
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm text-center">
                {t('← 3. szint', '← Level 3')}
              </Link>
              <Link to="/dashboard"
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md">
                {t('Játékok →', 'Games Hub →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
