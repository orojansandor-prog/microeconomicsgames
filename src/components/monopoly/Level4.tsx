import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'
import { solveMonopoly, solvePriceCap } from '../../engine/monopoly'
import { LEVEL4_SCENARIOS, pickRandom } from '../../engine/scenarios'
import { LEVEL4_QUIZ, pickQuestions } from '../../engine/quiz'
import { submitScore, calcTimeBonus } from '../../lib/scores'
import MonopolyChart from './charts/MonopolyChart'
import GameTimer from '../GameTimer'
import QuizPanel from '../QuizPanel'
import Leaderboard from '../Leaderboard'
import NotationBox from '../NotationBox'

type Phase = 'try' | 'quiz' | 'reveal'

const TOTAL_SECONDS = 120

export default function Level4() {
  const { t } = useI18n()
  const { session } = useAuth()

  const [sc] = useState(() => pickRandom(LEVEL4_SCENARIOS))
  const [phase, setPhase] = useState<Phase>('try')
  const [timerRunning, setTimerRunning] = useState(true)
  const secondsRemainingRef = useRef(TOTAL_SECONDS)
  const [quizQuestions] = useState(() => pickQuestions(LEVEL4_QUIZ, 3))
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  const [accuracyPoints, setAccuracyPoints] = useState(0)
  const [timeBonus, setTimeBonusState] = useState(0)
  const [quizPoints, setQuizPoints] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const { A, B, MC } = sc.params
  const BASE = solveMonopoly(sc.params)
  const twoB = 2 * B

  const [cap, setCap] = useState(() => Math.round(((BASE.P_monopoly + MC) / 2) / 5) * 5)

  const result = solvePriceCap(sc.params, cap)
  const noEffect = cap >= BASE.P_monopoly
  const overregulated = cap < MC

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
    // Accuracy: how close cap is to MC (optimal = MC)
    const optimalCap = MC
    const capDev = Math.abs(cap - optimalCap) / optimalCap
    let ap = 30
    if (capDev <= 0.02) ap = 500
    else if (capDev <= 0.05) ap = 420
    else if (capDev <= 0.10) ap = 320
    else if (capDev <= 0.20) ap = 200
    else if (capDev <= 0.30) ap = 100
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
        level: 4,
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
              <span className="text-slate-700 font-semibold">4. {t('Szabályozás', 'Regulation')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{t('Hol legyen az árplafon?', 'Where should the price cap be?')}</h1>
          </div>
          <div className="flex items-center gap-3">
            {phase !== 'reveal' && (
              <GameTimer totalSeconds={TOTAL_SECONDS} running={timerRunning} onExpire={handleTimerExpire} onTick={handleTimerTick} />
            )}
            <div className="flex items-center gap-1">
              <Link to="/games/monopoly/level/1" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">1</Link>
              <Link to="/games/monopoly/level/2" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">2</Link>
              <Link to="/games/monopoly/level/3" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">3</Link>
              <Link to="/games/monopoly/level/4" className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors bg-indigo-600 text-white shadow-sm">4</Link>
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
        {/* Szituáció — always visible */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-6">
          <div className="flex gap-4">
            <div className="text-4xl flex-shrink-0">{sc.icon}</div>
            <div>
              <h2 className="font-bold text-slate-900 text-base mb-1">{t(sc.titleHu, sc.titleEn)}</h2>
              <p className="text-slate-700 leading-relaxed text-sm">{t(sc.storyHu, sc.storyEn)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">D: P = {A} − {B}Q</span>
                <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-semibold">MC = {MC} Ft</span>
                <span className="text-xs bg-white border border-indigo-200 text-slate-600 px-2 py-1 rounded-lg font-semibold">{t(sc.regulatorHu, sc.regulatorEn)}</span>
              </div>
            </div>
          </div>
        </div>

        {phase === 'try' && (
          <>
            {/* Jelmagyarázat */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-lg">📐</span>
                {t('Jelmagyarázat — az árplafon közgazdaságtana', 'Legend — the economics of price caps')}
              </h2>
              <div className="space-y-2.5">
                {[
                  {
                    dot: 'bg-slate-500',
                    badge: 'bg-slate-50 text-slate-800 border-slate-200',
                    label: `${t('Szabályozás nélkül', 'Without regulation')}: P* = ${BASE.P_monopoly} Ft, Q* = ${BASE.Q_monopoly}`,
                    desc: t(
                      `A monopólium MR = MC alapján Q* = (${A}−${MC})/(${twoB}) = ${BASE.Q_monopoly}, P* = ${A}−${B}×${BASE.Q_monopoly} = ${BASE.P_monopoly} Ft. DWL = ${BASE.DWL} Ft.`,
                      `Monopoly sets Q* = (${A}−${MC})/(${twoB}) = ${BASE.Q_monopoly} via MR = MC, then P* = ${A}−${B}×${BASE.Q_monopoly} = ${BASE.P_monopoly}. DWL = ${BASE.DWL}.`,
                    ),
                  },
                  {
                    dot: 'bg-green-500',
                    badge: 'bg-green-50 text-green-800 border-green-200',
                    label: `${t('Hatékony plafon', 'Efficient cap')}: P_cap = MC = ${MC} Ft`,
                    desc: t(
                      `Ha a plafon = MC, az ár versenypiaci szintre süllyed: Q = ${BASE.Q_competitive}, DWL = 0. Fogyasztói többlet: ${BASE.CS_competitive} Ft (maximális).`,
                      `If cap = MC, price drops to competitive level: Q = ${BASE.Q_competitive}, DWL = 0. Consumer surplus: ${BASE.CS_competitive} (maximum).`,
                    ),
                  },
                  {
                    dot: 'bg-red-500',
                    badge: 'bg-red-50 text-red-800 border-red-200',
                    label: t('Túlszabályozás: P_cap < MC', 'Over-regulation: P_cap < MC'),
                    desc: t(
                      `Ha a plafon a határköltség alá kerül, a vállalat veszteséges → leállítja a termelést. Célod: MC közelébe hozni a plafont.`,
                      `If the cap falls below marginal cost, the firm loses money → stops production. Goal: bring the cap close to MC.`,
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

            {/* Csúszka */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-slate-800">{t('Árplafon szintje:', 'Price cap level:')}</h2>
                <span className={`text-4xl font-black transition-colors ${
                  noEffect ? 'text-slate-400' :
                  result.isEfficient ? 'text-green-500' :
                  overregulated ? 'text-red-500' : 'text-indigo-600'
                }`}>
                  {cap} Ft
                </span>
              </div>
              <input type="range" min={Math.round(MC * 0.5)} max={A} step={5} value={cap}
                onChange={e => setCap(Number(e.target.value))}
                className="w-full accent-indigo-600" />
              <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                <span className="text-red-400">↙ {t('Túlszabályozás', 'Over-reg.')}</span>
                <span className="text-green-600">MC = {MC}</span>
                <span className="text-indigo-500">P* = {BASE.P_monopoly}</span>
                <span>{A}</span>
              </div>

              <div className={`mt-4 rounded-xl p-3 text-sm font-semibold text-center transition-all ${
                noEffect ? 'bg-slate-100 text-slate-500' :
                result.isEfficient ? 'bg-green-100 text-green-700' :
                overregulated ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {noEffect && t(`A plafon (${cap}) ≥ P* (${BASE.P_monopoly}) → nincs hatás`, `Cap (${cap}) ≥ P* (${BASE.P_monopoly}) → no effect`)}
                {!noEffect && result.isEfficient && t(`✓ Hatékony szabályozás: P = MC = ${MC} Ft, DWL = 0`, `✓ Efficient regulation: P = MC = ${MC}, DWL = 0`)}
                {!noEffect && overregulated && t(`⚠️ Túlszabályozás: P_cap (${cap}) < MC (${MC}) → vállalat veszteséges`, `⚠️ Over-regulation: P_cap (${cap}) < MC (${MC}) → firm unprofitable`)}
                {!noEffect && !result.isEfficient && !overregulated && t(`Részleges hatás: DWL csökkent (${BASE.DWL} → ${result.DWL_capped.toFixed(1)})`, `Partial effect: DWL reduced (${BASE.DWL} → ${result.DWL_capped.toFixed(1)})`)}
              </div>
            </div>

            {/* Összefoglaló számok — no profit display */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t('Mennyiség', 'Quantity'), value: result.Q_cap.toFixed(1), sub: `vs. Q*=${BASE.Q_monopoly}`, color: 'text-slate-800' },
                { label: 'CS', value: result.CS_capped.toFixed(1), sub: `vs. ${BASE.CS_monopoly}`, color: 'text-green-600' },
                { label: 'DWL', value: result.DWL_capped.toFixed(1), sub: `alap: ${BASE.DWL}`, color: result.DWL_capped === 0 ? 'text-green-600' : 'text-red-500' },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
                  <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                  <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{item.sub}</div>
                </div>
              ))}
            </div>

            <button onClick={handleSubmit}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-lg shadow-md">
              {t('Beküldöm a plafonomat! →', 'Submit my cap! →')}
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
                  {t('Jelentkezz be az eredmény mentéséhez.', 'Sign in to save your score.')}
                </p>
              )}
            </div>

            {/* Tanulság */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-6">
              <h3 className="font-black text-indigo-900 text-lg mb-4">💡 {t('Tanulság — az árszabályozás paradoxona', 'Key takeaway — the paradox of price regulation')}</h3>
              <div className="space-y-3">
                {[
                  {
                    icon: '✅',
                    title: t(`Ha P_cap = MC (= ${MC} Ft):`, `If P_cap = MC (= ${MC}):`),
                    body: t(`DWL = 0, Q = ${BASE.Q_competitive} (versenypiaci), CS = ${BASE.CS_competitive} Ft (maximális). Ez a szabályozás "ideális" pontja.`,
                             `DWL = 0, Q = ${BASE.Q_competitive} (competitive), CS = ${BASE.CS_competitive} (maximum). This is the "ideal" point of regulation.`),
                    bg: 'bg-green-50 border-green-100',
                  },
                  {
                    icon: '⚖️',
                    title: t(`Ha MC < P_cap < P* (pl. ${Math.round((BASE.P_monopoly + MC) / 2)} Ft):`, `If MC < P_cap < P* (e.g. ${Math.round((BASE.P_monopoly + MC) / 2)}):`),
                    body: t(`A DWL csökken, CS nő, de a vállalat még profitábilis. Ezt alkalmazzák a gyakorlatban — kompromisszum a fogyasztóvédelem és a vállalat életképessége közt.`,
                             `DWL decreases, CS increases, firm still profitable. Used in practice — a balance between consumer protection and firm viability.`),
                    bg: 'bg-amber-50 border-amber-100',
                  },
                  {
                    icon: '⚠️',
                    title: t(`Ha P_cap < MC (= ${MC} Ft): Túlszabályozás!`, `If P_cap < MC (= ${MC}): Over-regulation!`),
                    body: t(`A vállalat veszteséges → leállítja a termelést, vagy szubvenció kell. A DWL paradox módon újra nőhet. Szélsőséges példa: ársapka Venezuelában a 2010-es években.`,
                             `Firm unprofitable → stops production, or subsidy needed. DWL may paradoxically rise again. Extreme example: price caps in Venezuela in the 2010s.`),
                    bg: 'bg-red-50 border-red-100',
                  },
                ].map(item => (
                  <div key={item.title} className={`bg-white rounded-xl p-4 border ${item.bg}`}>
                    <h4 className="font-bold text-slate-900 mb-1.5">{item.icon} {item.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-white rounded-xl text-sm text-slate-600 border border-indigo-100">
                {sc.icon} {t(
                  'Valós példa: EU gázár-plafon 2022–23-ban. Csökkentette a fogyasztói terheket, de vitát váltott ki arról, hogy a vállalatok beruházásai visszaesnek-e, ha az ár tartósan alacsony.',
                  'Real example: EU gas price cap 2022–23. Reduced consumer burden, but sparked debate about whether firm investment would decline with a persistently low price.',
                )}
              </div>
            </div>

            {/* Összehasonlítás tábla */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">{t('Szabályozás hatása — összefoglaló', 'Regulation impact — summary')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-slate-500 text-xs uppercase"></th>
                      <th className="text-center py-2 px-3 text-slate-500 font-bold text-xs">{t('Szabályozás nélkül', 'No regulation')}</th>
                      <th className="text-center py-2 px-3 text-amber-600 font-bold text-xs">{t(`Jelenlegi plafon (${cap} Ft)`, `Current cap (${cap})`)}</th>
                      <th className="text-center py-2 px-3 text-green-600 font-bold text-xs">{t(`P_cap = MC (${MC} Ft)`, `P_cap = MC (${MC})`)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Q', BASE.Q_monopoly, result.Q_cap.toFixed(1), BASE.Q_competitive],
                      ['P (Ft)', BASE.P_monopoly, cap, MC],
                      ['CS', BASE.CS_monopoly, result.CS_capped.toFixed(1), BASE.CS_competitive],
                      ['Profit', BASE.PS_monopoly, result.profit_capped.toFixed(1), 0],
                      ['DWL', BASE.DWL, result.DWL_capped.toFixed(1), 0],
                    ].map(([label, mono, curr, ideal]) => (
                      <tr key={String(label)} className="border-b border-slate-100">
                        <td className="py-2 px-3 text-slate-600 font-medium">{label}</td>
                        <td className="py-2 px-3 text-center font-mono font-semibold text-slate-600">{mono}</td>
                        <td className="py-2 px-3 text-center font-mono font-semibold text-amber-700">{curr}</td>
                        <td className="py-2 px-3 text-center font-mono font-semibold text-green-700">{ideal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grafikon */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">{t('Grafikon — a plafon hatása', "Chart — the cap's effect")}</h2>
              <MonopolyChart
                A={A} B={B} MC={MC}
                showMonopoly={noEffect}
                showCompetitive
                showDWL={!result.isEfficient && !noEffect}
                playerPrice={!noEffect ? cap : undefined}
              />
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">🏆 {t('Toplista — 4. szint', 'Leaderboard — Level 4')}</h2>
              <Leaderboard level={4} refreshKey={leaderboardKey} />
            </div>

            {/* Befejezés */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-xl font-black mb-2">{t('Monopólium játék teljesítve!', 'Monopoly game completed!')}</h2>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                {t(
                  'Megértetted az árszabályozás, az árdiszkrimináció, a DWL és a versenypiaci hatékonyság lényegét. A közgazdaságtan kulcsfogalmai most már nemcsak absztrakciók — játékban is átélted őket.',
                  'You understood price regulation, price discrimination, DWL, and competitive efficiency. These economics concepts are no longer just abstractions — you experienced them through play.',
                )}
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setPhase('try'); setTimerRunning(true); secondsRemainingRef.current = TOTAL_SECONDS }}
                  className="bg-white/20 border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors text-sm">
                  {t('← Újra', '← Retry')}
                </button>
                <Link to="/dashboard" className="inline-block bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-md text-sm">
                  {t('← Vissza a játékokhoz', '← Back to games')}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
