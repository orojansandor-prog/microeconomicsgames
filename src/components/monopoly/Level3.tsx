import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { solveMonopoly } from '../../engine/monopoly'
import { LEVEL3_SCENARIOS, pickRandom } from '../../engine/scenarios'
import { LEVEL3_QUIZ, pickQuestions } from '../../engine/quiz'
import { submitScore, calcTimeBonus } from '../../lib/scores'
import {
  ComposedChart, Line, ReferenceLine, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, Area
} from 'recharts'
import RevealTable from './RevealTable'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import Leaderboard from '../Leaderboard'
import NotationBox from '../NotationBox'

type Phase = 'try' | 'quiz' | 'reveal'

const TOTAL_SECONDS = 120

export default function Level3() {
  const { t } = useI18n()
  const { session } = useAuth()

  const [sc] = useState(() => pickRandom(LEVEL3_SCENARIOS))
  const [phase, setPhase] = useState<Phase>('try')
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(LEVEL3_QUIZ, 3))
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  const [accuracyPoints, setAccuracyPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const { A, B, MC } = sc.params
  const SOL = solveMonopoly(sc.params)
  const twoB = 2 * B

  const steps = 100
  const qMax = SOL.Q_competitive * 1.1
  // Garantáljuk, hogy a kulcsos Q értékek pontosan szerepelnek
  const rawQ = Array.from({ length: steps + 1 }, (_, i) => (qMax * i) / steps)
  const allQ = [...rawQ, SOL.Q_monopoly, SOL.Q_competitive]
    .sort((a, b) => a - b)
    .filter((q, i, arr) => i === 0 || Math.abs(q - arr[i - 1]) > 0.15)

  // dwlBase + dwlFill: stacked Area — csak Q_monopoly..Q_competitive közt
  // undefined kívül → tooltip végig működik; stacked fill MC-től demand-ig
  const data = allQ.map(Q => {
    const demand = parseFloat(Math.max(0, A - B * Q).toFixed(2))
    const MR     = parseFloat(Math.max(-MC, A - twoB * Q).toFixed(2))
    const inDWL  = Q >= SOL.Q_monopoly - 0.01 && Q <= SOL.Q_competitive + 0.01
    return {
      Q:        parseFloat(Q.toFixed(2)),
      demand,
      MR,
      MC,
      dwlBase: inDWL ? MC                                   : undefined,
      dwlFill: inDWL ? parseFloat((demand - MC).toFixed(2)) : undefined,
    }
  })

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

  const handleSubmit = () => {
    setPhase('quiz')
  }

  const finishQuiz = (correctCount: number) => {
    setTimerRunning(false)
    // For Level 3 (verseny vs. monopólium comparison), accuracy is based on
    // understanding: use a fixed accuracy score since there's no player slider.
    // Give full accuracy points since the player engaged with the material.
    const ap = 500
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
        level: 3,
        score: total,
        accuracy_points: ap,
        time_bonus: tb,
        quiz_points: qp,
        time_taken_seconds: TOTAL_SECONDS - secondsRemainingRef.current,
        scenario_id: sc.id,
      }).then(() => setLeaderboardKey(k => k + 1))
    }

    setPhase('reveal')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-0.5">
              <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">← Dashboard</Link>
              <span>›</span>
              <Link to="/games/monopoly" className="hover:text-indigo-600 transition-colors">{t('Monopólium', 'Monopoly')}</Link>
              <span>›</span>
              <span className="text-slate-700 font-semibold">3. {t('Verseny vs. Monopólium', 'Competition vs. Monopoly')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{t('Melyik piac jobb a társadalomnak?', 'Which market is better for society?')}</h1>
          </div>
          <div className="flex items-center gap-3">
            {phase !== 'reveal' && (
              <GameTimer totalSeconds={TOTAL_SECONDS} running={timerRunning} onExpire={handleTimerExpire} onTick={handleTimerTick} />
            )}
            <div className="flex items-center gap-1">
              <Link to="/games/monopoly/level/1" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">1</Link>
              <Link to="/games/monopoly/level/2" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">2</Link>
              <Link to="/games/monopoly/level/3" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-indigo-600 text-white shadow-sm">3</Link>
              <Link to="/games/monopoly/level/4" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">4</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        <NotationBox notations={[
          { symbol: 'P', full: 'Ár (Price)', note: 'a termék piaci ára' },
          { symbol: 'Q', full: 'Mennyiség (Quantity)', note: 'értékesített/termelt darabszám' },
          { symbol: 'TR', full: 'Teljes bevétel (Total Revenue)', formula: 'TR = P × Q', altSymbols: 'R, árbevétel' },
          { symbol: 'MR', full: 'Határbevétel (Marginal Revenue)', formula: 'MR = ΔTR / ΔQ', altSymbols: 'MB (marginal benefit)', note: 'egy extra egységből befolyó többletbevétel' },
          { symbol: 'MC', full: 'Határköltség (Marginal Cost)', formula: 'MC = ΔTC / ΔQ', altSymbols: 'MK (marginális költség)', note: 'egy extra egység előállításának pótlólagos költsége' },
          { symbol: 'π', full: 'Profit', formula: 'π = TR − TC', altSymbols: 'nyereség, Π' },
          { symbol: 'CS', full: 'Fogyasztói többlet (Consumer Surplus)', altSymbols: 'FS, FT', note: 'a fogyasztók "nyeresége" a tranzakción' },
          { symbol: 'PS', full: 'Termelői többlet (Producer Surplus)', altSymbols: 'TT, TS', note: 'a termelő profitja + fix költség feletti rész' },
          { symbol: 'DWL', full: 'Holtteher-veszteség (Deadweight Loss)', altSymbols: 'HV, jóléti veszteség' },
        ]} />
        {phase === 'try' && (
          <>
            {/* Szituáció */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-6">
              <div className="flex gap-4">
                <div className="text-4xl flex-shrink-0">{sc.icon}</div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base mb-1">{t(sc.titleHu, sc.titleEn)}</h2>
                  <p className="text-slate-700 leading-relaxed text-sm">{t(sc.storyHu, sc.storyEn)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">D: P = {A} − {B}Q</span>
                    <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">MC = {MC} Ft</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Jelmagyarázat */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-lg">📐</span>
                {t('Jelmagyarázat — jóléti fogalmak', 'Legend — welfare concepts')}
              </h2>
              <div className="space-y-2.5">
                {[
                  {
                    dot: 'bg-indigo-500',
                    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                    label: `CS — ${t('Fogyasztói többlet', 'Consumer surplus')}`,
                    desc: t(
                      `Az a összeg, amennyivel a vevők KEVESEBBET fizetnek, mint amennyit maximálisan hajlandók lennének fizetni. Versenypiacon: CS = ${SOL.CS_competitive} Ft. Monopóliumnál: CS = ${SOL.CS_monopoly} Ft — kisebb!`,
                      `The amount buyers pay LESS than their maximum willingness to pay. In competition: CS = ${SOL.CS_competitive}. Under monopoly: CS = ${SOL.CS_monopoly} — smaller!`,
                    ),
                  },
                  {
                    dot: 'bg-amber-400',
                    badge: 'bg-amber-50 text-amber-800 border-amber-200',
                    label: `PS — ${t('Termelői többlet', 'Producer surplus')} / Profit`,
                    desc: t(
                      `Amit a termelő az MC felett kap: (P − MC) × Q. Monopóliumnál: PS = ${SOL.PS_monopoly} Ft. Versenypiacon PS → 0.`,
                      `What the producer earns above MC: (P − MC) × Q. Under monopoly: PS = ${SOL.PS_monopoly}. In competition PS → 0.`,
                    ),
                  },
                  {
                    dot: 'bg-red-400',
                    badge: 'bg-red-50 text-red-800 border-red-200',
                    label: `DWL — ${t('Holtteher-veszteség', 'Deadweight loss')}`,
                    desc: t(
                      `Az elveszett társadalmi jólét: tranzakciók, amelyek mindkét félnek hasznot hoznának, de mégsem jönnek létre. DWL = ${SOL.DWL} Ft.`,
                      `Lost social welfare: transactions that would benefit both sides but never happen. DWL = ${SOL.DWL}.`,
                    ),
                  },
                ].map(item => (
                  <div key={item.label} className="flex gap-3 p-3 rounded-xl bg-slate-50">
                    <div className={`w-1 rounded-full flex-shrink-0 ${item.dot}`} />
                    <div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${item.badge}`}>{item.label}</span>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Összehasonlító táblázat */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-800 mb-4">{t('Két egyensúly összehasonlítása', 'Comparing two equilibria')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-slate-500 font-medium text-xs uppercase"></th>
                      <th className="text-center py-2 px-3 text-indigo-600 font-bold">🏭 {t('Monopólium', 'Monopoly')}</th>
                      <th className="text-center py-2 px-3 text-green-600 font-bold">⚖️ {t('Verseny', 'Competition')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Q',  mono: SOL.Q_monopoly,              comp: SOL.Q_competitive  },
                      { label: 'P',  mono: `${SOL.P_monopoly} Ft`,      comp: `${MC} Ft (= MC)`  },
                      { label: `CS`, mono: SOL.CS_monopoly,             comp: SOL.CS_competitive },
                      { label: `PS`, mono: SOL.PS_monopoly,             comp: 0                  },
                      { label: t('Össz-jólét', 'Total welfare'),
                        mono: SOL.CS_monopoly + SOL.PS_monopoly,        comp: SOL.CS_competitive },
                      { label: 'DWL', mono: SOL.DWL,                   comp: 0                  },
                    ].map(row => (
                      <tr key={row.label} className="border-b border-slate-100">
                        <td className="py-2.5 px-3 text-slate-600 font-medium">{row.label}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-indigo-700">{row.mono}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-green-700">{row.comp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gondolkodj */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-800 mb-4">{t('Gondolkodj, aztán kattints a továbblépésre:', 'Think, then click to continue:')}</h2>
              <div className="space-y-3 text-sm text-slate-700">
                {[
                  t('Melyik rendszer jobb a fogyasztóknak?', 'Which system is better for consumers?'),
                  t('Melyik jobb a vállalatnak?', 'Which is better for the firm?'),
                  t('Melyik hatékonyabb társadalmilag?', 'Which is socially efficient?'),
                ].map((q, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                    <span className="italic">{q}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleSubmit}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-lg shadow-md">
              {t('Továbbmegyek →', 'Continue →')}
            </button>
          </>
        )}

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

        {phase === 'reveal' && (
          <>
            {/* Pontszám kártya */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <h2 className="text-lg font-black mb-4">🏆 {t('Eredményed', 'Your score')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: t('Részvétel', 'Participation'), value: accuracyPoints, max: 500 },
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
              {!session && (
                <p className="text-xs text-indigo-200 text-center">
                  {t('Jelentkezz be az eredmény mentéséhez.', 'Sign in to save your score.')}
                </p>
              )}
            </div>

            {/* Kombinált grafikon */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">
                {t('Monopólium vs. versenypiaci egyensúly — egy grafikonon', 'Monopoly vs. competitive equilibrium — one chart')}
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                {t(`Sárga háromszög = DWL (${SOL.DWL} Ft). Q* monopólium = ${SOL.Q_monopoly}, Qc verseny = ${SOL.Q_competitive}.`,
                   `Yellow triangle = DWL (${SOL.DWL}). Q* monopoly = ${SOL.Q_monopoly}, Qc competitive = ${SOL.Q_competitive}.`)}
              </p>
              <div className="w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="Q" type="number" domain={[0, 'dataMax']}>
                      <Label value={t('Mennyiség (Q)', 'Quantity (Q)')} offset={-15} position="insideBottom" style={{ fontSize: 11, fill: '#94a3b8' }} />
                    </XAxis>
                    <YAxis domain={[-MC, A]}>
                      <Label value={t('Ár (P)', 'Price (P)')} angle={-90} position="insideLeft" offset={10} style={{ fontSize: 11, fill: '#94a3b8' }} />
                    </YAxis>
                    <Tooltip formatter={(v: unknown) => (typeof v === 'number' ? v.toFixed(1) : String(v))} />
                    <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                    {/* DWL háromszög: stacked Area, MC-től a keresleti görbéig */}
                    <Area dataKey="dwlBase" stackId="dwl" stroke="none" fill="transparent" legendType="none" name="__dwlBase" connectNulls={false} isAnimationActive={false} />
                    <Area dataKey="dwlFill" stackId="dwl" stroke="none" fill="#fef08a" fillOpacity={0.85} name="DWL" legendType="square" connectNulls={false} isAnimationActive={false} />
                    <Line dataKey="demand" stroke="#6366f1" strokeWidth={2} dot={false} name={t('Kereslet (D)', 'Demand (D)')} />
                    <Line dataKey="MR" stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="5 3" name="MR" />
                    <Line dataKey="MC" stroke="#22c55e" strokeWidth={2} dot={false} name={`MC = ${MC} = Pc (verseny)`} />
                    <ReferenceLine x={SOL.Q_monopoly} stroke="#6366f1" strokeDasharray="4 4" />
                    <ReferenceLine y={SOL.P_monopoly} stroke="#6366f1" strokeDasharray="4 4"
                      label={{ value: `P*=${SOL.P_monopoly}`, position: 'right', fontSize: 10, fill: '#6366f1' }} />
                    <ReferenceLine x={SOL.Q_competitive} stroke="#22c55e" strokeDasharray="4 4"
                      label={{ value: `Qc=${SOL.Q_competitive}`, position: 'top', fontSize: 10, fill: '#22c55e' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Jólét összehasonlítás */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
                <h3 className="font-bold text-indigo-800 mb-3">🏭 {t('Monopólium', 'Monopoly')}</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { l: 'Q*', v: SOL.Q_monopoly },
                    { l: 'P*', v: `${SOL.P_monopoly} Ft` },
                    { l: 'CS', v: SOL.CS_monopoly },
                    { l: 'PS', v: SOL.PS_monopoly, c: 'text-indigo-600' },
                    { l: t('Össz-jólét', 'Total welfare'), v: SOL.CS_monopoly + SOL.PS_monopoly, border: true },
                    { l: 'DWL', v: SOL.DWL, c: 'text-red-600' },
                  ].map(row => (
                    <div key={row.l} className={`flex justify-between ${row.border ? 'border-t border-indigo-200 pt-2 font-bold' : ''}`}>
                      <span className="text-slate-600">{row.l}</span>
                      <span className={`font-semibold ${row.c || ''}`}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <h3 className="font-bold text-green-800 mb-3">⚖️ {t('Versenypiaci', 'Competitive')}</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { l: 'Q*', v: SOL.Q_competitive },
                    { l: 'P*', v: `${MC} Ft (= MC)` },
                    { l: 'CS', v: SOL.CS_competitive, c: 'text-green-700' },
                    { l: 'PS', v: 0 },
                    { l: t('Össz-jólét', 'Total welfare'), v: SOL.CS_competitive, c: 'text-green-700', border: true },
                    { l: 'DWL', v: '0 ✓', c: 'text-green-600' },
                  ].map(row => (
                    <div key={row.l} className={`flex justify-between ${row.border ? 'border-t border-green-200 pt-2 font-bold' : ''}`}>
                      <span className="text-slate-600">{row.l}</span>
                      <span className={`font-semibold ${row.c || ''}`}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tábla */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">{t('Összefoglaló adattábla', 'Full data table')}</h2>
              <p className="text-xs text-slate-400 mb-4">{t('Zöld sor = monopol-optimum (Q*)', 'Green row = monopoly optimum (Q*)')}</p>
              <RevealTable params={sc.params} highlightQ={SOL.Q_monopoly} />
            </div>

            {/* Tanulság */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
              <h3 className="font-black text-indigo-900 text-lg mb-4">💡 {t('Tanulság', 'Key takeaway')}</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <h4 className="font-bold text-slate-900 mb-1.5">✅ {t('Versenypiaci hatékonyság', 'Competitive efficiency')}</h4>
                  <p className="text-slate-600 leading-relaxed">
                    {t(
                      `A versenypiaci egyensúly Pareto-hatékony: DWL = 0, össz-jólét = ${SOL.CS_competitive} Ft (maximális). P = MC = ${MC} Ft, Q = ${SOL.Q_competitive}.`,
                      `Competitive equilibrium is Pareto-efficient: DWL = 0, total welfare = ${SOL.CS_competitive} (maximum). P = MC = ${MC}, Q = ${SOL.Q_competitive}.`,
                    )}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-red-100">
                  <h4 className="font-bold text-slate-900 mb-1.5">⚠️ {t(`Monopólium: DWL = ${SOL.DWL} Ft elvész`, `Monopoly: DWL = ${SOL.DWL} disappears`)}</h4>
                  <p className="text-slate-600 leading-relaxed">
                    {t(
                      `A monopolista P* = ${SOL.P_monopoly} Ft-on csak Q* = ${SOL.Q_monopoly} egységet ad el. A Q* és Qc = ${SOL.Q_competitive} közötti potenciális tranzakciók elvesznek.`,
                      `The monopolist sells only Q* = ${SOL.Q_monopoly} at P* = ${SOL.P_monopoly}. Potential transactions between Q* and Qc = ${SOL.Q_competitive} are lost.`,
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded-xl text-sm text-slate-600 border border-indigo-100">
                {sc.icon} {t('Valós példa: trösztellenes (antitrust) jogszabályok — az EU és az USA azért bírságolja a monopóliumokat, hogy kikényszerítse a versenypiaci hatékonyságot és csökkentse a DWL-t.',
                              'Real example: antitrust laws — the EU and US fine monopolists to enforce competitive efficiency and reduce DWL.')}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('Toplista — 3. szint', 'Leaderboard — Level 3')}</h2>
              <Leaderboard level={3} refreshKey={leaderboardKey} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setPhase('try'); setTimerRunning(true); secondsRemainingRef.current = TOTAL_SECONDS }}
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm">
                {t('← Vissza', '← Back')}
              </button>
              <Link to="/games/monopoly/level/4"
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md">
                {t('4. szint — Szabályozás →', 'Level 4 — Regulation →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
