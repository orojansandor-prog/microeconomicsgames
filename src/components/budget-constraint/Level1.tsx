/**
 * 1. szint — Költségvetési egyenes
 * Productive failure: a játékos próbál minél több kávét VAGY minél több teát venni,
 * és rájön, hogy csak egy egyenes mentén választhat.
 * Ritmus: csinálja → leleplezés (táblázat + grafikon) → miért (tanulság + valós példa)
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { submitScore, calcTimeBonus } from '../../lib/scores'
import GameTimer from '../GameTimer'
import {
  budgetY,
  xIntercept,
  yIntercept,
  budgetSlope,
  spending,
} from '../../engine/budget-constraint'
import { BC_SCENARIOS, pickBCRandom } from '../../engine/bc-scenarios'
import BudgetChart from './charts/BudgetChart'
import NotationBox from '../NotationBox'
import Leaderboard from '../Leaderboard'

type Phase = 'try' | 'reveal'

const TOTAL_SECONDS = 120

export default function BCLevel1() {
  const { t } = useI18n()
  const { session } = useAuth()
  const [sc] = useState(() => pickBCRandom(BC_SCENARIOS))
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const p = sc.params
  const [phase, setPhase] = useState<Phase>('try')
  const [playerX, setPlayerX] = useState(Math.round(xIntercept(p) / 2))
  const [timerRunning, setTimerRunning] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_SECONDS)
  const [quizAnswer, setQuizAnswer] = useState<'yes' | 'no' | null>(null)
  const [scored, setScored] = useState(false)

  const X_max = xIntercept(p)
  const Y_max = yIntercept(p)

  const playerY = Math.floor((p.I - p.Px * playerX) / p.Py)
  const remaining = p.I - p.Px * playerX - p.Py * playerY
  const playerSpend = spending(p, playerX, playerY)
  const isOnBudget = Math.abs(playerSpend - p.I) < 1

  const quizCorrect = sc.quizAnswerIsYes ? quizAnswer === 'yes' : quizAnswer === 'no'

  const qp = quizCorrect ? 300 : 0
  const tb = calcTimeBonus(timeRemaining, TOTAL_SECONDS)
  const total = qp + tb

  const tableRows = [
    { X: 0,  Y: Y_max },
    { X: Math.round(X_max * 0.25), Y: budgetY(p, Math.round(X_max * 0.25)) },
    { X: Math.round(X_max * 0.5),  Y: budgetY(p, Math.round(X_max * 0.5)) },
    { X: Math.round(X_max * 0.75), Y: budgetY(p, Math.round(X_max * 0.75)) },
    { X: X_max, Y: 0 },
  ]

  const handleTimerTick = (r: number) => setTimeRemaining(r)
  const handleTimerExpire = () => setTimerRunning(false)

  const handleReveal = () => {
    setTimerRunning(false)
    setPhase('reveal')
    if (session && !scored) {
      setScored(true)
      submitScore({
        user_id: session.user.id,
        user_email: session.user.email!,
        level: 13,
        score: total,
        accuracy_points: 0,
        time_bonus: tb,
        quiz_points: qp,
        time_taken_seconds: TOTAL_SECONDS - timeRemaining,
        scenario_id: `bc-l1-${sc.id}`,
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
              <span className="text-slate-700 font-semibold">1. {t('Költségvetési egyenes', 'Budget Constraint')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {t('Melyikből mennyit választasz?', 'How much of each do you choose?')}
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
                    n === 1
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}>{n}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        <NotationBox notations={[
          { symbol: 'BC', full: 'Költségvetési korlát (Budget Constraint)', altSymbols: 'BL (Budget Line), költségvetési egyenes' },
          { symbol: 'I', full: 'Jövedelem (Income)', altSymbols: 'm (money), M, w', note: 'a rendelkezésre álló összeg' },
          { symbol: 'Px', full: 'X jószág ára (Price of X)', altSymbols: 'p1, p_x' },
          { symbol: 'Py', full: 'Y jószág ára (Price of Y)', altSymbols: 'p2, p_y' },
          { symbol: 'X, Y', full: 'Jószágmennyiségek (Quantities)', altSymbols: 'q1, q2, x1, x2' },
          { symbol: 'PxX + PyY = I', full: 'A budget line egyenlete', note: 'minden pont rajta pontosan elkölt' },
        ]} />

        {/* Szituáció */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-6">
          <div className="flex gap-4">
            <div className="text-4xl flex-shrink-0">{sc.icon}</div>
            <div>
              <h2 className="font-bold text-slate-900 text-base mb-1">
                {t(sc.titleHu, sc.titleEn)}
              </h2>
              <p className="text-slate-700 leading-relaxed text-sm">
                {t(sc.storyHu, sc.storyEn)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">
                  {t('Jövedelem (I)', 'Income (I)')} = {p.I.toLocaleString()} Ft
                </span>
                <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">
                  P<sub>{p.labelX}</sub> = {p.Px} Ft
                </span>
                <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">
                  P<sub>{p.labelY}</sub> = {p.Py} Ft
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TRY PHASE ── */}
        {phase === 'try' && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {t(`Állítsd be a(z) ${p.labelX} mennyiségét:`, `Set the amount of ${p.labelX}:`)}
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                {t(`A(z) ${p.labelY} mennyisége automatikusan számolódik, hogy pontosan elköltsd a pénzed.`, `${p.labelY} quantity is calculated automatically so you spend exactly your budget.`)}
              </p>

              <input
                type="range"
                min={0}
                max={X_max}
                step={1}
                value={playerX}
                onChange={e => setPlayerX(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1 mb-5">
                <span>0 {p.labelX} ({t('max', 'max')} {p.labelY}: {Y_max})</span>
                <span>{X_max} {p.labelX} (0 {p.labelY})</span>
              </div>

              {/* Eredmény kártyák */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: `X (${p.labelX})`, value: `${playerX} db`, color: 'text-amber-600', icon: sc.icon },
                  { label: `Y (${p.labelY})`, value: `${playerY} db`, color: 'text-emerald-600', icon: '🛒' },
                  { label: t('Kiadás', 'Spending'), value: `${playerSpend.toFixed(0)} Ft`, color: isOnBudget ? 'text-indigo-600' : 'text-red-500', icon: '💰' },
                  { label: t('Maradék', 'Remaining'), value: `${remaining} Ft`, color: 'text-slate-600', icon: '🏦' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-lg mb-0.5">{item.icon}</div>
                    <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                    <div className={`text-xl font-black ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-center text-slate-400 mt-4 italic">
                💡 {t(`Próbálj különböző értékeket! Mi az összefüggés a ${p.labelX} és a ${p.labelY} között?`, `Try different values! What is the relationship between ${p.labelX} and ${p.labelY}?`)}
              </p>
            </div>

            {/* Quiz */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="font-bold text-slate-800 mb-1">🤔 {t('Gyors kérdés', 'Quick question')}</h3>
              <p className="text-sm text-slate-700 mb-4">
                {t(sc.quizTextHu, sc.quizTextEn)}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setQuizAnswer('yes')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-colors ${quizAnswer === 'yes' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-slate-700 border-slate-200 hover:border-green-400'}`}
                >✅ {t('Igen', 'Yes')}</button>
                <button
                  onClick={() => setQuizAnswer('no')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-colors ${quizAnswer === 'no' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-700 border-slate-200 hover:border-red-400'}`}
                >❌ {t('Nem', 'No')}</button>
              </div>
              {quizAnswer && (
                <p className={`mt-3 text-xs font-semibold ${quizCorrect ? 'text-green-700' : 'text-red-600'}`}>
                  {quizCorrect
                    ? t(`✓ Helyes! ${sc.quizTextHu}`, `✓ Correct! ${sc.quizTextEn}`)
                    : t(`✗ Nem! ${sc.quizTextHu}`, `✗ No! ${sc.quizTextEn}`)}
                </p>
              )}
            </div>

            <button
              onClick={handleReveal}
              disabled={quizAnswer === null}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-lg shadow-md"
            >
              {t('Megmutatom, mit fedeztem fel! →', 'Show me what I discovered! →')}
            </button>
          </>
        )}

        {/* ── REVEAL PHASE ── */}
        {phase === 'reveal' && (
          <>
            {/* Score banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white">
              <h2 className="text-lg font-black mb-3">🏆 {t('Eredményed', 'Your score')}</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: t('Kvíz', 'Quiz'), value: qp },
                  { label: t('Időbónusz', 'Time bonus'), value: tb },
                  { label: t('Összesen', 'Total'), value: total },
                ].map(item => (
                  <div key={item.label} className="bg-white/20 rounded-xl p-3 text-center">
                    <div className="text-xs opacity-80 mb-0.5">{item.label}</div>
                    <div className="text-2xl font-black">{item.value}</div>
                  </div>
                ))}
              </div>
              {!quizCorrect && (
                <p className="mt-3 text-xs opacity-80">
                  {t(`A helyes válasz: ${sc.quizAnswerIsYes ? 'Igen' : 'Nem'} — ${sc.quizTextHu}. Legközelebb +300 pont!`,
                     `Correct answer: ${sc.quizAnswerIsYes ? 'Yes' : 'No'} — ${sc.quizTextEn}. Next time +300 pts!`)}
                </p>
              )}
            </div>

            {/* Banner */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6">
              <div className="text-4xl mb-2">📐</div>
              <h2 className="text-xl font-black text-slate-900 mb-1">
                {t('Ez a Költségvetési Egyenes!', 'This is the Budget Constraint!')}
              </h2>
              <p className="text-sm text-slate-600">
                {t(
                  `A ${p.Px}X + ${p.Py}Y = ${p.I} egyenlet egy egyenest rajzol ki az X-Y térben. Minden pont rajta pontosan elköltöd a ${p.I} Ft-ot.`,
                  `The equation ${p.Px}X + ${p.Py}Y = ${p.I} draws a line in X-Y space. Every point on it spends exactly ${p.I} Ft.`,
                )}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: t(`X-metszéspt. (max ${p.labelX})`, `X-intercept (max ${p.labelX})`), value: `${X_max} db`, color: 'text-indigo-700' },
                  { label: t(`Y-metszéspt. (max ${p.labelY})`, `Y-intercept (max ${p.labelY})`), value: `${Y_max} db`, color: 'text-indigo-700' },
                  { label: t('Meredekség (−Px/Py)', 'Slope (−Px/Py)'), value: `${budgetSlope(p)}`, color: 'text-amber-700' },
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
                {t('Interaktív grafikon — Költségvetési Egyenes', 'Interactive chart — Budget Constraint')}
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                {t('A kék vonal minden elérhető (X, Y) kombinációt mutat.', 'The blue line shows all feasible (X, Y) combinations.')}
              </p>
              <BudgetChart
                params={p}
                budgetLines={[{ params: p, color: '#6366f1', name: t('Költségvetési egyenes', 'Budget line') }]}
                dots={[
                  { X: playerX, Y: playerY, color: '#f59e0b', label: t('Te', 'You') },
                  { X: X_max, Y: 0, color: '#6366f1', label: `(${X_max}, 0)` },
                  { X: 0, Y: Y_max, color: '#6366f1', label: `(0, ${Y_max})` },
                ]}
              />
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-900">
                  {t(`Az egyenes meredeksége = −Px/Py = −${p.Px}/${p.Py} = ${budgetSlope(p)}`, `Slope = −Px/Py = −${p.Px}/${p.Py} = ${budgetSlope(p)}`)}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {t(
                    `Ez az opportunity cost: ha 1-gyel több ${p.labelX}-t veszel, ${Math.abs(budgetSlope(p))} ${p.labelY}-ról kell lemondanod.`,
                    `This is the opportunity cost: buying 1 more ${p.labelX} means giving up ${Math.abs(budgetSlope(p))} ${p.labelY}.`,
                  )}
                </p>
              </div>
            </div>

            {/* Táblázat */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {t('Szemléltető tábla — pontok a budget line-on', 'Illustrative table — points on the budget line')}
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                {t('Minden sorban: P_x·X + P_y·Y = I. Ugyanaz a kiadás, más összetétel.', 'Each row: P_x·X + P_y·Y = I. Same spending, different composition.')}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 px-3 text-left text-xs font-bold text-slate-500 uppercase">{sc.icon} {t(`${p.labelX} (X)`, `${p.labelX} (X)`)}</th>
                      <th className="py-2 px-3 text-left text-xs font-bold text-slate-500 uppercase">🛒 {t(`${p.labelY} (Y)`, `${p.labelY} (Y)`)}</th>
                      <th className="py-2 px-3 text-left text-xs font-bold text-slate-500 uppercase">{t('Kiadás (Ft)', 'Spending (Ft)')}</th>
                      <th className="py-2 px-3 text-left text-xs font-bold text-slate-500 uppercase">{t('Budget-e?', 'On budget?')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map(({ X, Y }) => {
                      const sp = spending(p, X, Y)
                      const onB = Math.abs(sp - p.I) < 1
                      return (
                        <tr key={X} className={`border-b border-slate-100 ${onB ? 'bg-emerald-50' : ''}`}>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800 text-left">{X}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800 text-left">{Y.toFixed(1)}</td>
                          <td className="py-2 px-3 font-mono text-slate-700 text-left">{sp.toFixed(0)}</td>
                          <td className="py-2 px-3 text-left">
                            {onB
                              ? <span className="text-emerald-600 font-bold text-xs">✓ igen</span>
                              : <span className="text-red-400 text-xs">✗ nem</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MR = MC stílusú levezetés */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-mono px-2 py-1 rounded-lg border border-indigo-200">
                  {p.Px}X + {p.Py}Y = {p.I}
                </span>
                <span>{t('— Hogyan olvassuk a budget line-t?', '— How to read the budget line?')}</span>
              </h2>
              <div className="space-y-3">
                {[
                  {
                    n: '1',
                    lbl: t(`Y-metszéspontja (max ${p.labelY})`, `Y-intercept (max ${p.labelY})`),
                    formula: `Y_max = I/P_y = ${p.I}/${p.Py} = ${Y_max}`,
                    desc: t(`Ha egyáltalán nem veszel ${p.labelX}-t (X=0), ${Y_max} ${p.labelY}-t vehetsz.`, `If you buy no ${p.labelX} (X=0), you can buy ${Y_max} ${p.labelY}.`),
                  },
                  {
                    n: '2',
                    lbl: t(`X-metszéspontja (max ${p.labelX})`, `X-intercept (max ${p.labelX})`),
                    formula: `X_max = I/P_x = ${p.I}/${p.Px} = ${X_max}`,
                    desc: t(`Ha egyáltalán nem veszel ${p.labelY}-t (Y=0), ${X_max} ${p.labelX}-t vehetsz.`, `If you buy no ${p.labelY} (Y=0), you can buy ${X_max} ${p.labelX}.`),
                  },
                  {
                    n: '3',
                    lbl: t('Meredekség (opportunity cost)', 'Slope (opportunity cost)'),
                    formula: `meredekség = −P_x/P_y = −${p.Px}/${p.Py} = ${budgetSlope(p)}`,
                    desc: t(
                      `Minden +1 ${p.labelX} ára: le kell mondanod ${Math.abs(budgetSlope(p))} ${p.labelY}-ról. Ez az opportunity cost.`,
                      `Every +1 ${p.labelX} costs you ${Math.abs(budgetSlope(p))} ${p.labelY}. That is the opportunity cost.`,
                    ),
                  },
                  {
                    n: '4',
                    lbl: t('Átrendezve Y-ra', 'Rearranged for Y'),
                    formula: `Y = ${Y_max} ${budgetSlope(p)}X`,
                    desc: t(
                      `Ez az egyenes egyenlete — bármely X-hez megkapod a megengedett Y-t.`,
                      `This is the line equation — for any X, you get the feasible Y.`,
                    ),
                  },
                ].map(s => (
                  <div key={s.n} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.n}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs font-semibold text-slate-500">{s.lbl}:</span>
                        <code className="text-sm font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{s.formula}</code>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tanulság */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-6">
              <h3 className="font-black text-indigo-900 text-lg mb-4">💡 {t('Tanulság', 'Key takeaway')}</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <h4 className="font-bold text-slate-900 mb-1.5">🔑 {t('Mi a budget line lényege?', 'What is the budget line?')}</h4>
                  <p className="text-slate-700">
                    {t(
                      'A költségvetési egyenes az összes olyan (X, Y) kombináció, amely pontosan elkölt a jövedelmedből. Felette: nem engedheted meg magadnak. Alatta: van maradék — de akkor nem a legtöbbet hozod ki a pénzedből.',
                      'The budget line is all (X, Y) combinations that exactly spend your income. Above it: unaffordable. Below it: you have leftover — but you are not getting the most out of your money.',
                    )}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <h4 className="font-bold text-slate-900 mb-1.5">⚖️ {t('Mi az opportunity cost?', 'What is opportunity cost?')}</h4>
                  <p className="text-slate-700">
                    {t(
                      `A meredekség = −${Math.abs(budgetSlope(p))} azt jelenti: ha 1-gyel több ${p.labelX}-t veszel, ${Math.abs(budgetSlope(p))} ${p.labelY}-ról kell lemondanod. Ez az igazi ár — nem forintban, hanem elveszett ${p.labelY}-ban mérve.`,
                      `The slope = −${Math.abs(budgetSlope(p))} means: each extra ${p.labelX} costs you ${Math.abs(budgetSlope(p))} ${p.labelY}. This is the true price — measured not in money but in ${p.labelY} forgone.`,
                    )}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-white rounded-xl border border-indigo-100">
                    <div className="text-xs font-bold text-indigo-700 mb-1.5">{sc.icon} {t('Valós példa', 'Real example')}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t(
                        'Egy diák havi 30 000 Ft-ból él. Streaming (1500 Ft) vs. mozijegy (3000 Ft). Minden mozi = 2 streaming lemondása. A budget line azonnal megmutatja, mit "ér" valójában egy mozizás.',
                        'A student lives on 30,000 Ft/month. Streaming (1,500 Ft) vs. cinema (3,000 Ft). Every cinema visit = giving up 2 streaming months. The budget line shows the true cost of a film night.',
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-indigo-100">
                    <div className="text-xs font-bold text-indigo-700 mb-1.5">📈 {t('Mi változtatja meg a budget line-t?', 'What changes the budget line?')}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t(
                        `Jövedelem nő → egyenes párhuzamosan jobbra-felfelé tolódik. ${p.labelX} ára nő → X-metszőpont balra tolódik, egyenes meredekebb lesz (drágább az opportunity cost).`,
                        `Income rises → line shifts right-up in parallel. ${p.labelX} price rises → X-intercept moves left, line becomes steeper (opportunity cost is higher).`,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            
            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('1. szint (FE)', 'Level 1 (BC)')}</h2>
              <Leaderboard level={13} refreshKey={leaderboardKey} />
            </div>

            {/* Navigáció */}
            <div className="flex gap-3">
              <button
                onClick={() => setPhase('try')}
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm"
              >
                {t('← Próbálom újra', '← Try again')}
              </button>
              <Link
                to="/games/budget-constraint/level/2"
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md"
              >
                {t('2. szint — Közömbösségi görbék →', 'Level 2 — Indifference Curves →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
