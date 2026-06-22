import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { solveMonopoly } from '../../engine/monopoly'
import { LEVEL1_SCENARIOS, pickRandom } from '../../engine/scenarios'
import { LEVEL1_QUIZ, pickQuestions } from '../../engine/quiz'
import { submitScore, calcAccuracyPoints, calcTimeBonus } from '../../lib/scores'
import MonopolyChart from './charts/MonopolyChart'
import RevealTable from './RevealTable'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import Leaderboard from '../Leaderboard'
import NotationBox from '../NotationBox'

type Phase = 'try' | 'quiz' | 'reveal'

const TOTAL_SECONDS = 120

export default function Level1() {
  const { t } = useI18n()
  const { session } = useAuth()

  const [sc] = useState(() => pickRandom(LEVEL1_SCENARIOS))
  const [phase, setPhase] = useState<Phase>('try')
  const [price, setPrice] = useState(() => Math.round((sc.sliderMin + sc.sliderMax) / 2 / sc.sliderStep) * sc.sliderStep)
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(LEVEL1_QUIZ, 3))
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  // Score state
  const [accuracyPoints, setAccuracyPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const { A, B, MC } = sc.params
  const sol = solveMonopoly(sc.params)

  const sold = sc.buyers.filter(b => b.wtp >= price)

  const twoB = 2 * B
  const Qstar = sol.Q_monopoly
  const Pstar = sol.P_monopoly

  const derivation = [
    { n: '1', lbl: t('Keresleti egyenlet', 'Demand equation'),
      formula: `P = ${A} − ${B}Q`,
      desc: t(`A piaci ár a Q eladott egység függvénye. Ha Q nő 1-gyel, P ${B} Ft-tal csökken.`,
              `Market price as a function of Q units sold. Each extra unit sold drops price by ${B}.`) },
    { n: '2', lbl: t('Határbevétel (MR)', 'Marginal revenue (MR)'),
      formula: `MR = ${A} − ${twoB}Q`,
      desc: t(`Lineáris keresletnél MR kétszer olyan meredek, mint D. Ha Q nő 1-gyel, MR ${twoB} Ft-tal csökken.`,
              `For linear demand MR has twice the slope of D. Each extra unit drops MR by ${twoB}.`) },
    { n: '3', lbl: t('Profitmax. feltétel: MR = MC', 'Profit-max condition: MR = MC'),
      formula: `${A} − ${twoB}Q = ${MC}`,
      desc: t('Ahol MR = MC, ott a profit maximális. Ha MR > MC, érdemes még egyet eladni; ha MR < MC, az utolsó egység veszteséges.',
              'Where MR = MC profit is maximised. If MR > MC sell more; if MR < MC the last unit loses money.') },
    { n: '4', lbl: t('Megoldás Q-ra', 'Solve for Q'),
      formula: `${twoB}Q = ${A - MC}  →  Q* = ${Qstar}`,
      desc: t(`A profitmaximalizáló mennyiség: ${Qstar} egység.`, `Profit-maximising quantity: ${Qstar} units.`) },
    { n: '5', lbl: t('Ár a keresleti görbéről', 'Price from demand curve'),
      formula: `P* = ${A} − ${B}×${Qstar} = ${Pstar} Ft`,
      desc: t(`Ennyit hajlandók fizetni a vevők, ha Q = ${Qstar}.`, `What buyers will pay when Q = ${Qstar}.`) },
    { n: '6', lbl: t('Profit ellenőrzés', 'Profit check'),
      formula: `π = (${Pstar}−${MC}) × ${Qstar} = ${sol.profit_monopoly} Ft`,
      desc: t('(P* − MC) × Q* — ár-MC különbség szorozva a mennyiséggel.',
              '(P* − MC) × Q* — price-cost margin times quantity.') },
  ]

  const notBuying = sc.buyers.filter(b => b.wtp < sol.P_monopoly)

  const handleTimerTick = (remaining: number) => {
    secondsRemainingRef.current = remaining
  }

  const handleTimerExpire = () => {
    setTimerRunning(false)
    if (phase === 'try') {
      // Auto-advance to quiz with current price
      setPhase('quiz')
    } else if (phase === 'quiz') {
      // Auto-complete quiz with 0 correct
      finishQuiz(0)
    }
  }

  const handleSubmitPrice = () => {
    setPhase('quiz')
  }

  const finishQuiz = (correctCount: number) => {
    setTimerRunning(false)
    const playerQ = Math.max(0, (A - price) / B)
    const optimalQ = sol.Q_monopoly
    const ap = calcAccuracyPoints(playerQ, optimalQ)
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
        level: 1,
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
      {/* Sticky header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-0.5">
              <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">← Dashboard</Link>
              <span>›</span>
              <Link to="/games/monopoly" className="hover:text-indigo-600 transition-colors">{t('Monopólium', 'Monopoly')}</Link>
              <span>›</span>
              <span className="text-slate-700 font-semibold">1. {t('Árdöntés', 'Price Setting')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{t('Melyik áron a legnagyobb a profitod?', 'At which price is your profit highest?')}</h1>
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
              <Link to="/games/monopoly/level/1" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-indigo-600 text-white shadow-sm">1</Link>
              <Link to="/games/monopoly/level/2" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">2</Link>
              <Link to="/games/monopoly/level/3" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">3</Link>
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

        {/* ── TRY PHASE ── */}
        {phase === 'try' && (
          <>
            {/* Szituáció */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-6">
              <div className="flex gap-4">
                <div className="text-4xl flex-shrink-0">{sc.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-slate-900 text-base">{t(sc.titleHu, sc.titleEn)}</h2>
                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{t(sc.industryHu, sc.industryEn)}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm">{t(sc.storyHu, sc.storyEn)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">MC = {MC} Ft</span>
                    <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">{t('Kereslet: P = ', 'Demand: P = ')}{A} − {B}Q</span>
                    <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">{t('Nincs verseny', 'No competition')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Jelmagyarázat */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-lg">📐</span>
                {t('Jelmagyarázat — mit jelent minden szám?', 'Legend — what does every number mean?')}
              </h2>
              <div className="space-y-2.5">
                {[
                  {
                    dot: 'bg-indigo-500',
                    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                    label: `D — ${t('Kereslet', 'Demand')}: P = ${A} − ${B}Q`,
                    desc: t(
                      `Minél magasabb az ár, annál kevesebben vesznek. Ha P = ${sol.P_monopoly} Ft, akkor Q = (${A}−${sol.P_monopoly})/${B} = ${Qstar} egységet tudnál eladni.`,
                      `The higher the price, the fewer buyers. At P = ${sol.P_monopoly} you could sell Q = (${A}−${sol.P_monopoly})/${B} = ${Qstar} units.`,
                    ),
                  },
                  {
                    dot: 'bg-orange-500',
                    badge: 'bg-orange-50 text-orange-800 border-orange-200',
                    label: `MR — ${t('Határbevétel', 'Marginal Revenue')}: ${A} − ${twoB}Q`,
                    desc: t(
                      `Az utolsó eladott egységből szerzett EXTRA bevétel. Mivel mindenkit ugyanazon az áron kell kiszolgálnod, ha lejjebb mégy az árral az összes korábbi egységet is olcsóbban adod el — ezért MR < P mindig.`,
                      `The EXTRA revenue from the last unit sold. Since you charge everyone the same price, lowering it cuts revenue on all previous units too — so MR < P always.`,
                    ),
                  },
                  {
                    dot: 'bg-emerald-500',
                    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    label: `MC — ${t('Határköltség', 'Marginal Cost')} = ${MC} Ft`,
                    desc: t(
                      `Egy extra egység előállítási és szállítási költsége = ${MC} Ft, állandó. Érdemes termelni, amíg MR > MC — addig minden egység hozzáad a profithoz. Ha MR < MC, az utolsó egység veszteséges.`,
                      `The cost to produce one more unit = ${MC}, constant. Worth producing as long as MR > MC — each unit adds to profit. If MR < MC, the last unit loses money.`,
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

            {/* Vásárlók */}
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                {t('Az 5 vásárlód és fizetési hajlandóságuk', 'Your 5 buyers and their willingness to pay')}
              </h2>
              <div className="grid grid-cols-5 gap-2">
                {sc.buyers.map(b => {
                  const willBuy = b.wtp >= price
                  return (
                    <div key={b.name} className={`rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                      willBuy
                        ? 'border-emerald-300 bg-emerald-50 shadow-sm scale-105'
                        : 'border-slate-200 bg-white opacity-40'
                    }`}>
                      <div className="text-2xl mb-1">{b.emoji}</div>
                      <div className="font-bold text-slate-800 text-xs">{b.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{t(b.roleHu, b.roleEn)}</div>
                      <div className={`mt-1.5 text-sm font-black ${willBuy ? 'text-emerald-600' : 'text-slate-300'}`}>{b.wtp} Ft</div>
                      <div className={`text-xs font-bold mt-0.5 ${willBuy ? 'text-emerald-500' : 'text-slate-300'}`}>
                        {willBuy ? `✓ ${t('vesz', 'buys')}` : `✗ ${t('kimarad', 'out')}`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Árcsúszka */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-bold text-slate-800">{t('Állítsd be az árat:', 'Set your price:')}</h2>
                <div className="text-right">
                  <span className="text-5xl font-black text-indigo-600">{price}</span>
                  <span className="text-lg font-semibold text-slate-400 ml-1">Ft</span>
                </div>
              </div>

              <input
                type="range" min={sc.sliderMin} max={sc.sliderMax} step={sc.sliderStep} value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>{sc.sliderMin} Ft {t('(MC közelében)', '(near MC)')}</span>
                <span>{sc.sliderMax} Ft {t('(max)', '(max)')}</span>
              </div>

              {/* Stat kártyák — csak P és Q, profit rejtve */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { label: t('Beállított ár', 'Set price'), value: `${price} Ft`, color: 'text-indigo-600' },
                  { label: t('Eladott egységek', 'Units sold'), value: `${sold.length} db`, color: 'text-slate-800' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                    <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-xs text-center text-slate-400 italic">
                💡 {t('Próbálj különböző árakat — melyik maximalizálja a profitod?', 'Try different prices — which maximises your profit?')}
              </div>
            </div>

            <button
              onClick={handleSubmitPrice}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-lg shadow-md hover:shadow-lg"
            >
              {t('Beküldöm az áramat! →', 'Submit my price! →')}
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
                <p className="text-xs text-slate-500">{t('Az óra még fut. Helyes válasz = +100 pont.', 'Timer is still running. Correct answer = +100 pts.')}</p>
              </div>
            </div>
            <QuizPanel questions={quizQuestions} onComplete={finishQuiz} />
          </div>
        )}

        {/* ── REVEAL PHASE ── */}
        {phase === 'reveal' && (
          <>
            {/* Pontszám kártya */}
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
              {!session && (
                <p className="text-xs text-indigo-200 text-center">
                  {t('Jelentkezz be az eredmény mentéséhez és a toplista megtekintéséhez.', 'Sign in to save your score and see the leaderboard.')}
                </p>
              )}
            </div>

            {/* Eredmény banner */}
            <div className={`rounded-2xl border-2 p-6 ${price === Pstar
              ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50'
              : 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50'}`}>
              <div className="text-4xl mb-2">{price === Pstar ? '🎯' : '📊'}</div>
              <h2 className="text-xl font-black text-slate-900 mb-1">
                {price === Pstar
                  ? t('Tökéletes! Megtaláltad a profitmaximalizáló árat.', 'Perfect! You found the profit-maximizing price.')
                  : t(`Te ${price} Ft-ot választottál — az optimum ${Pstar} Ft.`, `You chose ${price} — the optimum is ${Pstar}.`)
                }
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                {t(`A profitmaximalizáló feltétel: MR = MC → Q* = ${Qstar}, P* = ${Pstar} Ft, profit = ${sol.profit_monopoly} Ft.`,
                   `Profit-maximizing condition: MR = MC → Q* = ${Qstar}, P* = ${Pstar}, profit = ${sol.profit_monopoly}.`)}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: t('Mennyiség (Q*)', 'Quantity (Q*)'), value: Qstar,               color: 'text-indigo-700' },
                  { label: t('Ár (P*)',         'Price (P*)'),   value: `${Pstar} Ft`,        color: 'text-indigo-700' },
                  { label: t('Max profit',      'Max profit'),   value: sol.profit_monopoly,  color: 'text-emerald-700' },
                  { label: t('Holtteher (DWL)', 'DWL'),          value: sol.DWL,              color: 'text-red-600' },
                ].map(item => (
                  <div key={item.label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                    <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* MR = MC levezetés */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2 flex-wrap">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-mono px-2 py-1 rounded-lg border border-indigo-200">MR = MC</span>
                <span>{t(`— Miért pontosan ${Pstar} Ft az optimális ár?`, `— Why is ${Pstar} exactly the optimal price?`)}</span>
              </h2>
              <div className="space-y-3">
                {derivation.map(s => (
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

            {/* Grafikon */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">{t('Interaktív grafikon — Kereslet · MR · MC · Egyensúly', 'Interactive chart — Demand · MR · MC · Equilibrium')}</h2>
              <p className="text-xs text-slate-400 mb-4">{t('Mozgasd az egeret a görbéken — az egyensúlyi pontnál pontos értékeket látsz.', 'Hover over the curves — exact values at the equilibrium point.')}</p>
              <MonopolyChart A={A} B={B} MC={MC} showMonopoly showDWL
                playerPrice={price !== Pstar ? price : undefined} />
              <div className="mt-4 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">{t('Jelmagyarázat', 'Legend')}</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    { swatch: 'bg-indigo-500', label: `${t('Kereslet (D)', 'Demand (D)')}: P = ${A} − ${B}Q`,
                      desc: t('Csökkenő fizetési hajlandóság — a kereslet görbéje.', 'Declining willingness to pay — the demand curve.') },
                    { swatch: 'bg-orange-400', label: `MR: ${A} − ${twoB}Q`,
                      desc: t(`Kétszer olyan meredek, mint D. MR = MC → Q* = ${Qstar}.`, `Twice the slope of D. MR = MC → Q* = ${Qstar}.`) },
                    { swatch: 'bg-emerald-500', label: `MC = ${MC} Ft`,
                      desc: t('Állandó vízszintes vonal — minden egység előállítási költsége egyforma.', 'Constant horizontal line — every unit costs the same to produce.') },
                    { swatch: 'bg-yellow-300 border border-yellow-400', label: t('Sárga terület = DWL (holtteher)', 'Yellow area = DWL (deadweight loss)'),
                      desc: t(`Q* és Qc közötti háromszög — elveszett társadalmi jólét = ${sol.DWL} Ft.`, `Triangle between Q* and Qc — lost social welfare = ${sol.DWL}.`) },
                    ...(price !== Pstar ? [{ swatch: 'bg-amber-400', label: t(`A te árad: ${price} Ft`, `Your price: ${price}`),
                      desc: t('Látható, mennyivel tér el a választott ár az optimumtól.', 'Shows how far your chosen price is from the optimum.') }] : []),
                  ].map(item => (
                    <div key={item.label} className="flex gap-2.5 items-start p-2.5 rounded-xl bg-slate-50">
                      <div className={`w-3 h-3 rounded-sm flex-shrink-0 mt-0.5 ${item.swatch}`} />
                      <div>
                        <div className="text-xs font-bold text-slate-700">{item.label}</div>
                        <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Összefoglaló tábla */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-1">{t('Teljes adattábla — Q, P, TR, MR, Profit', 'Full data table — Q, P, TR, MR, Profit')}</h2>
              <p className="text-xs text-slate-400 mb-4">{t('TR = P×Q, MR = ΔTR/ΔQ, Profit = TR − TC. A zöld sor a profitmaximum.', 'TR = P×Q, MR = ΔTR/ΔQ, Profit = TR − TC. Green row = profit maximum.')}</p>
              <RevealTable params={sc.params} highlightQ={Qstar} />
            </div>

            {/* Tanulság */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-6">
              <h3 className="font-black text-indigo-900 text-lg mb-5">💡 {t('Tanulság — mit jelent mindez?', 'Key takeaway — what does this all mean?')}</h3>
              <div className="space-y-4 text-sm leading-relaxed">
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <h4 className="font-bold text-slate-900 mb-1.5">🚫 {t('Miért nem a legmagasabb ár?', 'Why not the highest price?')}</h4>
                  <p className="text-slate-700">
                    {t(
                      `${sc.sliderMax} Ft-ért senki sem vásárol (${sc.buyers[0].name} max. ${sc.buyers[0].wtp} Ft-ot adna). Nagyon magas áron csak 1 vevő van — a bevétel összeomlana. Alacsonyabb áron több vevő → összesített bevétel nő.`,
                      `At ${sc.sliderMax} nobody buys (${sc.buyers[0].name} would pay at most ${sc.buyers[0].wtp}). At very high prices only 1 buyer — revenue would collapse. At lower prices more buyers → total revenue rises.`,
                    )}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <h4 className="font-bold text-slate-900 mb-1.5">🚫 {t('Miért nem a legalacsonyabb ár?', 'Why not the lowest price?')}</h4>
                  <p className="text-slate-700">
                    {t(
                      `${MC} Ft-on (= MC) mindenki venne, de profit = 0. Ez a versenypiaci egyensúly — fogyasztóknak ideális, termelőnek értelmetlen. ${MC - 5} Ft alatt minden egység veszteséges.`,
                      `At ${MC} (= MC) everyone buys, but profit = 0. This is competitive equilibrium — ideal for consumers, pointless for the producer. Below ${MC - 5} every unit is a loss.`,
                    )}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <h4 className="font-bold text-slate-900 mb-1.5">✅ {t(`Miért pont ${Pstar} Ft az optimum?`, `Why is ${Pstar} exactly optimal?`)}</h4>
                  <p className="text-slate-700">
                    {t(
                      `Q = ${Qstar}-nél MR = ${A}−${twoB}×${Qstar} = ${MC} = MC. A profit maximális: (${Pstar}−${MC})×${Qstar} = ${sol.profit_monopoly} Ft.`,
                      `At Q = ${Qstar}: MR = ${A}−${twoB}×${Qstar} = ${MC} = MC. Profit is maximised: (${Pstar}−${MC})×${Qstar} = ${sol.profit_monopoly}.`,
                    )}
                  </p>
                </div>
                {notBuying.length > 0 && (
                  <div className="bg-white rounded-xl p-4 border border-red-100">
                    <h4 className="font-bold text-slate-900 mb-1.5">⚠️ {t('A DWL — a monopólium ára a társadalomnak', 'DWL — the social cost of monopoly')}</h4>
                    <p className="text-slate-700">
                      {t(
                        `${notBuying.map(b => `${b.name} (max. ${b.wtp} Ft)`).join(' és ')} nem jut termékhez, mert az ár ${Pstar} Ft. DWL = ${sol.DWL} Ft elveszett társadalmi jólét.`,
                        `${notBuying.map(b => `${b.name} (max. ${b.wtp})`).join(' and ')} cannot afford the product at ${Pstar}. DWL = ${sol.DWL} in lost social welfare.`,
                      )}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-5 grid sm:grid-cols-2 gap-3">
                <div className="p-4 bg-white rounded-xl border border-indigo-100">
                  <div className="text-xs font-bold text-indigo-700 mb-1.5">{sc.icon} {t('Valós példa', 'Real example')}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{t(sc.realExampleHu, sc.realExampleEn)}</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-indigo-100">
                  <div className="text-xs font-bold text-indigo-700 mb-1.5">📜 {t('Szabályozás: antitrust törvények', 'Regulation: antitrust laws')}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t(
                      'A DWL csökkentése érdekében az EU és az USA trösztellenes törvényeket alkalmaz. Az EU Versenyhatósága a Google-t 4,34 milliárd €-ra büntette monopolhelyzettel való visszaélés miatt.',
                      'To reduce DWL, the EU and US enforce antitrust laws. The EU Competition Authority fined Google €4.34B for abusing its dominant position.',
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('Toplista — 1. szint', 'Leaderboard — Level 1')}</h2>
              <Leaderboard level={1} refreshKey={leaderboardKey} />
            </div>

            {/* Navigáció */}
            <div className="flex gap-3">
              <button onClick={() => { setPhase('try'); setTimerRunning(true); secondsRemainingRef.current = TOTAL_SECONDS }}
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm">
                {t('← Próbálom újra', '← Try again')}
              </button>
              <Link to="/games/monopoly/level/2"
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-md">
                {t('2. szint — Árdiszkrimináció →', 'Level 2 — Price Discrimination →')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
