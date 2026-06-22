// costs-quiz.ts — Quiz questions for the costs game

export interface QuizQuestion {
  id: string
  hu: string
  en: string
  options: { hu: string; en: string }[]
  correctIndex: number
}

// ---------------------------------------------------------------------------
// Level 1 — FC vs VC
// ---------------------------------------------------------------------------
export const COSTS_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'c1-01',
    hu: 'Mi jellemzi a fix költséget?',
    en: 'What characterizes a fixed cost?',
    options: [
      { hu: 'A termeléssel arányosan nő', en: 'It increases proportionally with output' },
      { hu: 'Nem függ a termelési mennyiségtől', en: 'It does not depend on the quantity produced' },
      { hu: 'Mindig kisebb, mint a változó ktg', en: 'It is always smaller than variable cost' },
      { hu: 'Csak rövid távon létezik', en: 'It only exists in the short run' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c1-02',
    hu: 'Ha a pékség Q=0 esetén sem termel, mekkora a TC?',
    en: 'If the bakery produces Q=0, what is TC?',
    options: [
      { hu: 'Nulla', en: 'Zero' },
      { hu: '50 Ft', en: '50 Ft' },
      { hu: '100 Ft (csak FC)', en: '100 Ft (only FC)' },
      { hu: 'Függ a piaci ártól', en: 'Depends on the market price' },
    ],
    correctIndex: 2,
  },
  {
    id: 'c1-03',
    hu: 'Melyik a fix költség példája egy pékségben?',
    en: 'Which is an example of a fixed cost in a bakery?',
    options: [
      { hu: 'Lisztköltség', en: 'Flour cost' },
      { hu: 'Munkabér (órabér alapon)', en: 'Hourly wages' },
      { hu: 'Bérleti díj', en: 'Rent' },
      { hu: 'Csomagolóanyag', en: 'Packaging material' },
    ],
    correctIndex: 2,
  },
  {
    id: 'c1-04',
    hu: 'Ha a termelés megduplázódik (Q: 5 → 10), mi történik a fix költséggel?',
    en: 'If output doubles (Q: 5 → 10), what happens to fixed cost?',
    options: [
      { hu: 'Megduplázódik', en: 'It doubles' },
      { hu: 'Felére csökken', en: 'It halves' },
      { hu: 'Nem változik', en: 'It stays the same' },
      { hu: 'Nőhet vagy csökkenhet', en: 'It may rise or fall' },
    ],
    correctIndex: 2,
  },
  {
    id: 'c1-05',
    hu: 'TC = FC + VC. Ha FC=100 és VC=165, mekkora a TC?',
    en: 'TC = FC + VC. If FC=100 and VC=165, what is TC?',
    options: [
      { hu: '65 Ft', en: '65 Ft' },
      { hu: '165 Ft', en: '165 Ft' },
      { hu: '265 Ft', en: '265 Ft' },
      { hu: '300 Ft', en: '300 Ft' },
    ],
    correctIndex: 2,
  },
  {
    id: 'c1-06',
    hu: 'Miért csökken az AFC (átlagos fix ktg) ahogy Q nő?',
    en: 'Why does AFC (average fixed cost) decrease as Q rises?',
    options: [
      { hu: 'Mert a fix ktg csökken', en: 'Because fixed cost decreases' },
      { hu: 'Mert a fix ktg összege egyre több egységre oszlik szét', en: 'Because the fixed cost is spread over more and more units' },
      { hu: 'Mert a változó ktg nő', en: 'Because variable cost increases' },
      { hu: 'Mert az AVC nő', en: 'Because AVC increases' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c1-07',
    hu: 'Mi a különbség a TC és a VC között?',
    en: 'What is the difference between TC and VC?',
    options: [
      { hu: 'A változó ktg', en: 'The variable cost' },
      { hu: 'A profit', en: 'The profit' },
      { hu: 'A fix ktg (állandóan 100 Ft)', en: 'The fixed cost (always 100 Ft)' },
      { hu: 'Az átlagos ktg', en: 'The average cost' },
    ],
    correctIndex: 2,
  },
  {
    id: 'c1-08',
    hu: 'Melyik igaz a változó költségre?',
    en: 'Which is true about variable cost?',
    options: [
      { hu: 'Q=0-nál is fennáll', en: 'It exists even at Q=0' },
      { hu: 'Q=0-nál nulla, és Q növekedésével nő', en: 'It is zero at Q=0, and rises as Q increases' },
      { hu: 'Mindig nagyobb, mint a fix ktg', en: 'It is always greater than fixed cost' },
      { hu: 'Nem befolyásolja a TC-t', en: 'It does not affect TC' },
    ],
    correctIndex: 1,
  },
]

// ---------------------------------------------------------------------------
// Level 2 — MC
// ---------------------------------------------------------------------------
export const COSTS_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'c2-01',
    hu: 'Mi az MC (határköltség / marginal cost) definíciója?',
    en: 'What is the definition of MC (marginal cost)?',
    options: [
      { hu: 'TC / Q', en: 'TC / Q' },
      { hu: 'ΔTC / ΔQ — az egyik extra egység előállításának ktg', en: 'ΔTC / ΔQ — the cost of producing one extra unit' },
      { hu: 'VC / Q', en: 'VC / Q' },
      { hu: 'FC / Q', en: 'FC / Q' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c2-02',
    hu: 'TC(5) = 265 Ft, TC(6) = 292 Ft. Mennyi a 6. kosár MC-je?',
    en: 'TC(5) = 265, TC(6) = 292. What is MC of the 6th basket?',
    options: [
      { hu: '265 Ft', en: '265 Ft' },
      { hu: '292 Ft', en: '292 Ft' },
      { hu: '27 Ft', en: '27 Ft' },
      { hu: '48,7 Ft', en: '48.7 Ft' },
    ],
    correctIndex: 2,
  },
  {
    id: 'c2-03',
    hu: 'Miért U-alakú az MC görbe?',
    en: 'Why is the MC curve U-shaped?',
    options: [
      { hu: 'Mert a fix ktg csökken', en: 'Because fixed cost decreases' },
      { hu: 'Eleinte munkamegosztás (specializáció) csökkenti; majd a hozadékcsökkentés növeli', en: 'Initially specialization reduces it; then diminishing returns raise it' },
      { hu: 'Mert az ATC is U-alakú', en: 'Because ATC is also U-shaped' },
      { hu: 'Mert az állam megadóztatja a termelőt', en: 'Because the government taxes the producer' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c2-04',
    hu: 'Mikor éri meg még egy egységet előállítani?',
    en: 'When is it worth producing one more unit?',
    options: [
      { hu: 'Ha MC > ATC', en: 'If MC > ATC' },
      { hu: 'Ha MC < piaci ár (P)', en: 'If MC < market price (P)' },
      { hu: 'Ha MC = AVC', en: 'If MC = AVC' },
      { hu: 'Mindig', en: 'Always' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c2-05',
    hu: 'Mi a különbség az MC és az ATC között?',
    en: 'What is the difference between MC and ATC?',
    options: [
      { hu: 'MC az összes egység átlagos ktg-e, ATC az extra ktg', en: 'MC is the average cost of all units, ATC is the extra cost' },
      { hu: 'MC az EGY EXTRA egység ktg-e, ATC az összes egység átlaga', en: 'MC is the cost of ONE EXTRA unit, ATC is the average over all units' },
      { hu: 'Nincsen különbség', en: 'There is no difference' },
      { hu: 'MC mindig nagyobb, mint ATC', en: 'MC is always greater than ATC' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c2-06',
    hu: 'Melyik Q-nál minimális az MC ebben a pékségben?',
    en: 'At which Q is MC minimized in this bakery?',
    options: [
      { hu: 'Q = 3 (MC = 30)', en: 'Q = 3 (MC = 30)' },
      { hu: 'Q = 5 (MC = 21)', en: 'Q = 5 (MC = 21)' },
      { hu: 'Q = 7 (MC = 39)', en: 'Q = 7 (MC = 39)' },
      { hu: 'Q = 10 (MC = 111)', en: 'Q = 10 (MC = 111)' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c2-07',
    hu: 'Ha az MC csökken (kisebb az átlagnál), mi történik az ATC-vel?',
    en: 'If MC is decreasing (below average), what happens to ATC?',
    options: [
      { hu: 'ATC nő', en: 'ATC rises' },
      { hu: 'ATC csökken', en: 'ATC falls' },
      { hu: 'ATC nem változik', en: 'ATC stays the same' },
      { hu: 'ATC minimálissá válik', en: 'ATC reaches its minimum' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c2-08',
    hu: 'Az MC görbe melyik görbét(ket) metszi annak minimumában?',
    en: 'Which curve(s) does the MC curve intersect at their minimum?',
    options: [
      { hu: 'Csak az ATC-t', en: 'Only ATC' },
      { hu: 'Csak az AVC-t', en: 'Only AVC' },
      { hu: 'Mind az ATC-t, mind az AVC-t (a saját minimumaikban)', en: 'Both ATC and AVC (at their respective minima)' },
      { hu: 'Az AFC-t', en: 'The AFC' },
    ],
    correctIndex: 2,
  },
]

// ---------------------------------------------------------------------------
// Level 3 — ATC, AVC, AFC
// ---------------------------------------------------------------------------
export const COSTS_L3_QUIZ: QuizQuestion[] = [
  {
    id: 'c3-01',
    hu: 'Mire egyenlő az ATC?',
    en: 'What does ATC equal?',
    options: [
      { hu: 'VC / Q', en: 'VC / Q' },
      { hu: 'TC / Q = AFC + AVC', en: 'TC / Q = AFC + AVC' },
      { hu: 'FC / Q', en: 'FC / Q' },
      { hu: 'MC × Q', en: 'MC × Q' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c3-02',
    hu: 'Miért U-alakú az ATC görbe?',
    en: 'Why is the ATC curve U-shaped?',
    options: [
      { hu: 'Mert az MC mindig csökken', en: 'Because MC always decreases' },
      { hu: 'Az AFC lefelé húzza; majd az AVC emelkedése dominálja', en: 'AFC pulls it down; then rising AVC dominates' },
      { hu: 'Mert a fix ktg nő', en: 'Because fixed cost rises' },
      { hu: 'Mert az ár csökken', en: 'Because the price falls' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c3-03',
    hu: 'Melyik Q-nál a legalacsonyabb az ATC ebben a pékségben?',
    en: 'At which Q is ATC lowest in this bakery?',
    options: [
      { hu: 'Q = 5 (ATC = 53)', en: 'Q = 5 (ATC = 53)' },
      { hu: 'Q = 6 (ATC = 48.7)', en: 'Q = 6 (ATC = 48.7)' },
      { hu: 'Q = 7 (ATC = 47.3)', en: 'Q = 7 (ATC = 47.3)' },
      { hu: 'Q = 10 (ATC = 58)', en: 'Q = 10 (ATC = 58)' },
    ],
    correctIndex: 2,
  },
  {
    id: 'c3-04',
    hu: 'Mi a leállási küszöb (shutdown point)?',
    en: 'What is the shutdown point?',
    options: [
      { hu: 'Ahol P = min ATC', en: 'Where P = min ATC' },
      { hu: 'Ahol P = min AVC', en: 'Where P = min AVC' },
      { hu: 'Ahol MC = 0', en: 'Where MC = 0' },
      { hu: 'Ahol profit = 0', en: 'Where profit = 0' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c3-05',
    hu: 'Q=7-nél ATC=47.3 és MC=39. Az ATC következő lépésben (Q=8) mit tesz?',
    en: 'At Q=7, ATC=47.3 and MC=39. What does ATC do at Q=8?',
    options: [
      { hu: 'Tovább csökken (MC < ATC)', en: 'Continues falling (MC < ATC)' },
      { hu: 'Emelkedik (MC > ATC, mert MC@8 = 57 > 47.3)', en: 'Rises (MC > ATC, since MC@8 = 57 > 47.3)' },
      { hu: 'Nem változik', en: 'Stays the same' },
      { hu: 'Nulla lesz', en: 'Becomes zero' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c3-06',
    hu: 'Miért metszi az MC görbe az ATC-t pontosan a minimum pontjában?',
    en: 'Why does the MC curve intersect the ATC exactly at its minimum?',
    options: [
      { hu: 'Véletlen egybeesés', en: 'Coincidence' },
      { hu: 'Ha MC < ATC, az átlag csökken; ha MC > ATC, nő — a metszéspontban egyensúly', en: 'If MC < ATC, average falls; if MC > ATC, average rises — intersection is the tipping point' },
      { hu: 'Mert mindkettő U-alakú görbe', en: 'Because both are U-shaped curves' },
      { hu: 'Mert az AFC ekkor nulla', en: 'Because AFC is zero at that point' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c3-07',
    hu: 'Mi az AVC minimuma ebben a pékségben, és melyik Q-nál?',
    en: 'What is the minimum AVC in this bakery, and at which Q?',
    options: [
      { hu: '21 Ft, Q=5-nél', en: '21 Ft at Q=5' },
      { hu: '32 Ft, Q=6-nál', en: '32 Ft at Q=6' },
      { hu: '47.3 Ft, Q=7-nél', en: '47.3 Ft at Q=7' },
      { hu: '33 Ft, Q=7-nél', en: '33 Ft at Q=7' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c3-08',
    hu: 'Hosszú távon miért kell P ≥ min ATC?',
    en: 'Why must P ≥ min ATC in the long run?',
    options: [
      { hu: 'Mert különben a cég leállítja a termelést azonnal', en: 'Because the firm immediately stops production' },
      { hu: 'Mert különben a vállalkozó inkább kilép a piacról (veszteség hosszú távon)', en: 'Because otherwise the entrepreneur exits the market (long-run loss)' },
      { hu: 'Mert az állam előírja', en: 'Because the government requires it' },
      { hu: 'Mert az AVC mindig nő', en: 'Because AVC always increases' },
    ],
    correctIndex: 1,
  },
]

// ---------------------------------------------------------------------------
// Level 4 — Profit maximization
// ---------------------------------------------------------------------------
export const COSTS_L4_QUIZ: QuizQuestion[] = [
  {
    id: 'c4-01',
    hu: 'Versenypiacon hogyan maximalizálja a profitot a cég?',
    en: 'How does a firm maximize profit in a competitive market?',
    options: [
      { hu: 'P = ATC', en: 'P = ATC' },
      { hu: 'P = MC', en: 'P = MC' },
      { hu: 'MC = ATC', en: 'MC = ATC' },
      { hu: 'TR = TC', en: 'TR = TC' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c4-02',
    hu: 'P=60-nál melyik Q-nál maximális a profit? (MC@7=39, MC@8=57, MC@9=81)',
    en: 'At P=60, at which Q is profit maximized? (MC@7=39, MC@8=57, MC@9=81)',
    options: [
      { hu: 'Q = 7 (MC=39 < 60, de Q=8-nál is érdemes)', en: 'Q = 7 (MC=39 < 60, but Q=8 is also profitable)' },
      { hu: 'Q = 8 (MC=57 < 60; MC@9=81 > 60 → állj meg)', en: 'Q = 8 (MC=57 < 60; MC@9=81 > 60 → stop)' },
      { hu: 'Q = 9', en: 'Q = 9' },
      { hu: 'Q = 10', en: 'Q = 10' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c4-03',
    hu: 'Mi a profit definíciója?',
    en: 'What is the definition of profit?',
    options: [
      { hu: 'TR (összbevétel)', en: 'TR (total revenue)' },
      { hu: 'TR − TC (bevétel mínusz összes ktg)', en: 'TR − TC (revenue minus total cost)' },
      { hu: 'P × MC', en: 'P × MC' },
      { hu: 'TR − VC', en: 'TR − VC' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c4-04',
    hu: 'Ha P=60 és Q*=8, mekkora a profit? (TR=480, TC=388)',
    en: 'If P=60 and Q*=8, what is profit? (TR=480, TC=388)',
    options: [
      { hu: '480 Ft', en: '480 Ft' },
      { hu: '388 Ft', en: '388 Ft' },
      { hu: '92 Ft', en: '92 Ft' },
      { hu: '−92 Ft', en: '−92 Ft' },
    ],
    correctIndex: 2,
  },
  {
    id: 'c4-05',
    hu: 'Ha P=25 (< min AVC=32), mit tegyen a pékség?',
    en: 'If P=25 (< min AVC=32), what should the bakery do?',
    options: [
      { hu: 'Termeljen tovább — a profit negatív, de csak kicsit', en: 'Keep producing — profit is negative but only slightly' },
      { hu: 'Állítsa le a termelést (Q=0) — veszteség = FC = 100 (ez a minimum)', en: 'Shut down (Q=0) — loss = FC = 100 (this is the minimum)' },
      { hu: 'Növelje az árat 32-re', en: 'Raise the price to 32' },
      { hu: 'Csökkentse a fix ktg-et', en: 'Reduce fixed costs' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c4-06',
    hu: 'Ha P=40 (> min AVC=32, de < min ATC=47.3), mit tegyen a pékség?',
    en: 'If P=40 (> min AVC=32 but < min ATC=47.3), what should the bakery do?',
    options: [
      { hu: 'Leálljon — veszteséggel jár', en: 'Shut down — it is making a loss' },
      { hu: 'Termeljen tovább — veszteséggel de legalább a VC-t fedezi, ami jobb mint leállni', en: 'Keep producing — at a loss but covers VC, better than shutting down' },
      { hu: 'Emelje az árat', en: 'Raise the price' },
      { hu: 'Csökkentse a mennyiséget nullára', en: 'Reduce quantity to zero' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c4-07',
    hu: 'A monopolistánál MR < P és az egyensúly MR = MC. Versenyhelyzethez képest ez azt jelenti:',
    en: 'For a monopolist MR < P and equilibrium is MR = MC. Compared to competition, this means:',
    options: [
      { hu: 'Ugyanolyan Q és P', en: 'Same Q and P' },
      { hu: 'Kisebb Q, magasabb P (a monopolista visszafogja a termelést)', en: 'Lower Q, higher P (monopolist restricts output)' },
      { hu: 'Nagyobb Q, alacsonyabb P', en: 'Higher Q, lower P' },
      { hu: 'Csak az ár különbözik', en: 'Only price differs' },
    ],
    correctIndex: 1,
  },
  {
    id: 'c4-08',
    hu: 'Miért nem számít az "elmerült ktg" (sunk cost) a döntésben?',
    en: 'Why does "sunk cost" not matter for decisions?',
    options: [
      { hu: 'Mert az állam megtéríti', en: 'Because the government reimburses it' },
      { hu: 'Mert már megtörtént és nem visszafordítható — csak a jövőbeli ktg és bevétel dönt', en: 'Because it already happened and is irreversible — only future costs and revenues matter' },
      { hu: 'Mert mindig nulla', en: 'Because it is always zero' },
      { hu: 'Mert az ATC részét képezi', en: 'Because it is part of ATC' },
    ],
    correctIndex: 1,
  },
]

export function pickQuestions(pool: QuizQuestion[], n = 3): QuizQuestion[] {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, n)
}
