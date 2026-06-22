// supply-demand-quiz.ts
// Quiz questions for the supply-demand game.
// Standalone — does not import from quiz.ts.

export interface QuizQuestion {
  id: string
  hu: string
  en: string
  options: { hu: string; en: string }[]
  correctIndex: number
}

// ---------------------------------------------------------------------------
// Level 1 — Piaci egyensúly / Market Equilibrium (8 questions)
// ---------------------------------------------------------------------------

export const SD_LEVEL1_QUIZ: QuizQuestion[] = [
  {
    id: 'sd1-01',
    hu: 'Mi jellemzi a piaci egyensúlyt?',
    en: 'What characterizes market equilibrium?',
    options: [
      { hu: 'A keresett és a kínált mennyiség egyenlő', en: 'Quantity demanded equals quantity supplied' },
      { hu: 'Az ár maximális', en: 'The price is at its maximum' },
      { hu: 'Az ár minimális', en: 'The price is at its minimum' },
      { hu: 'A termelők profitja nulla', en: "Producers' profit is zero" },
    ],
    correctIndex: 0,
  },
  {
    id: 'sd1-02',
    hu: 'Ha az ár az egyensúlyi szint felett van, mi történik?',
    en: 'If the price is above the equilibrium level, what happens?',
    options: [
      { hu: 'Hiány alakul ki', en: 'A shortage develops' },
      { hu: 'Felesleg alakul ki', en: 'A surplus develops' },
      { hu: 'Az egyensúly nem változik', en: 'Equilibrium remains unchanged' },
      { hu: 'A kereslet nő', en: 'Demand increases' },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd1-03',
    hu: 'Ha az ár az egyensúlyi szint alatt van, mi a következmény?',
    en: 'If the price is below equilibrium, what is the consequence?',
    options: [
      { hu: 'Felesleg alakul ki', en: 'A surplus develops' },
      { hu: 'A piac egyensúlyban marad', en: 'The market stays in equilibrium' },
      { hu: 'Hiány alakul ki', en: 'A shortage develops' },
      { hu: 'A kínálat csökken', en: 'Supply decreases' },
    ],
    correctIndex: 2,
  },
  {
    id: 'sd1-04',
    hu: 'Mit mér a fogyasztói többlet (CS)?',
    en: 'What does consumer surplus (CS) measure?',
    options: [
      { hu: 'A fogyasztók által fizetett teljes összeget', en: 'The total amount paid by consumers' },
      { hu: 'A különbséget a fizetési hajlandóság és a tényleges ár között', en: 'The difference between willingness to pay and the actual price' },
      { hu: 'A termelők nyereségét', en: "Producers' profit" },
      { hu: 'Az állami adóbevételt', en: 'Government tax revenue' },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd1-05',
    hu: 'Mit mér a termelői többlet (PS)?',
    en: 'What does producer surplus (PS) measure?',
    options: [
      { hu: 'A termelési költségek összegét', en: 'The total production cost' },
      { hu: 'A bevétel és a változó költség közötti különbséget', en: 'The difference between revenue and variable cost' },
      { hu: 'A fogyasztók hasznát', en: "Consumers' benefit" },
      { hu: 'Az egyensúlyi mennyiséget', en: 'The equilibrium quantity' },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd1-06',
    hu: 'Mekkorák a társadalmi jólét (TS) egy versenypiaci egyensúlyban?',
    en: 'What is total surplus (TS) in a competitive market equilibrium?',
    options: [
      { hu: 'Kisebb, mint bármely más kimenetelben', en: 'Smaller than in any other outcome' },
      { hu: 'Nulla, mert DWL = 0', en: 'Zero, because DWL = 0' },
      { hu: 'Maximális — CS + PS', en: 'Maximum — CS + PS' },
      { hu: 'Csak a fogyasztói többlettel egyenlő', en: 'Equal only to consumer surplus' },
    ],
    correctIndex: 2,
  },
  {
    id: 'sd1-07',
    hu: 'Mi az ún. holtteher-veszteség (DWL)?',
    en: 'What is deadweight loss (DWL)?',
    options: [
      { hu: 'Az állam által elvont adóbevétel', en: 'Tax revenue collected by the government' },
      { hu: 'A versenypiaci szintnél kisebb társadalmi jólét elveszett része', en: 'The portion of social welfare lost compared to the competitive level' },
      { hu: 'A fogyasztók által fizetett ár és az egyensúlyi ár különbsége', en: 'The difference between the price consumers pay and the equilibrium price' },
      { hu: 'A termelők vesztesége', en: "Producers' loss" },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd1-08',
    hu: 'Lineáris kereslet esetén (P = A − Bd·Q) mit jelent a „B" paraméter?',
    en: 'For linear demand (P = A − Bd·Q), what does the "Bd" parameter represent?',
    options: [
      { hu: 'A maximális keresleti árat', en: 'The maximum demand price' },
      { hu: 'A kereslet meredekségét (lejtőjét)', en: 'The slope (steepness) of demand' },
      { hu: 'Az egyensúlyi mennyiséget', en: 'The equilibrium quantity' },
      { hu: 'A fogyasztói többletet', en: 'Consumer surplus' },
    ],
    correctIndex: 1,
  },
]

// ---------------------------------------------------------------------------
// Level 2 — Eltolódások / Shifts (8 questions)
// ---------------------------------------------------------------------------

export const SD_LEVEL2_QUIZ: QuizQuestion[] = [
  {
    id: 'sd2-01',
    hu: 'Melyik tényező tolja el a keresleti görbét?',
    en: 'Which factor shifts the demand curve?',
    options: [
      { hu: 'A termék saját árának változása', en: "A change in the product's own price" },
      { hu: 'A fogyasztók jövedelmének változása', en: "A change in consumers' income" },
      { hu: 'A termelési technológia javulása', en: 'Improvement in production technology' },
      { hu: 'Nyersanyagárak csökkentése', en: 'A decrease in raw material prices' },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd2-02',
    hu: 'Ha a fogyasztók jövedelme nő, mi történik a normál jószág keresletével?',
    en: "If consumers' income rises, what happens to demand for a normal good?",
    options: [
      { hu: 'A keresleti görbe balra tolódik', en: 'The demand curve shifts left' },
      { hu: 'A keresleti görbe jobbra tolódik', en: 'The demand curve shifts right' },
      { hu: 'Az egyensúlyi ár csökken', en: 'The equilibrium price falls' },
      { hu: 'A keresleti görbe meredeksége változik', en: 'The slope of the demand curve changes' },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd2-03',
    hu: 'Melyik tényező tolja el a kínálati görbét?',
    en: 'Which factor shifts the supply curve?',
    options: [
      { hu: 'A fogyasztói preferenciák változása', en: 'A change in consumer preferences' },
      { hu: 'A kiegészítő termékek árának változása', en: "A change in a complement's price" },
      { hu: 'A termelési költségek változása', en: 'A change in production costs' },
      { hu: 'A helyettesítő termékek iránti kereslet', en: 'Demand for substitute goods' },
    ],
    correctIndex: 2,
  },
  {
    id: 'sd2-04',
    hu: 'Ha a termelési technológia javul, hogyan változik az egyensúly?',
    en: 'If production technology improves, how does equilibrium change?',
    options: [
      { hu: 'Az ár nő, a mennyiség csökken', en: 'Price rises, quantity falls' },
      { hu: 'Az ár csökken, a mennyiség nő', en: 'Price falls, quantity rises' },
      { hu: 'Mindkettő nő', en: 'Both rise' },
      { hu: 'Mindkettő csökken', en: 'Both fall' },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd2-05',
    hu: 'Ha egyszerre nő a kereslet és a kínálat, mi mondható biztosan?',
    en: 'If both demand and supply increase simultaneously, what can be said for certain?',
    options: [
      { hu: 'Az ár biztosan nő', en: 'Price definitely rises' },
      { hu: 'Az ár biztosan csökken', en: 'Price definitely falls' },
      { hu: 'Az egyensúlyi mennyiség biztosan nő', en: 'Equilibrium quantity definitely rises' },
      { hu: 'A fogyasztói többlet biztosan csökken', en: 'Consumer surplus definitely falls' },
    ],
    correctIndex: 2,
  },
  {
    id: 'sd2-06',
    hu: 'Két áru egymást helyettesíti (pl. vaj és margarin). Ha az egyik ára megdrágul, mi történik a másik iránti kereslettel?',
    en: 'Two goods are substitutes (e.g. butter and margarine). If the price of one rises, what happens to demand for the other?',
    options: [
      { hu: 'A kereslet csökken', en: 'Demand decreases' },
      { hu: 'A kereslet nem változik', en: 'Demand does not change' },
      { hu: 'A kereslet nő', en: 'Demand increases' },
      { hu: 'A kínálat nő', en: 'Supply increases' },
    ],
    correctIndex: 2,
  },
  {
    id: 'sd2-07',
    hu: 'Két áru egymást kiegészíti (pl. autó és benzin). Ha az egyik ára emelkedik, mi történik a másik iránti kereslettel?',
    en: 'Two goods are complements (e.g. cars and petrol). If the price of one rises, what happens to demand for the other?',
    options: [
      { hu: 'A kereslet nő', en: 'Demand increases' },
      { hu: 'A kereslet csökken', en: 'Demand decreases' },
      { hu: 'A kínálat csökken', en: 'Supply decreases' },
      { hu: 'Az egyensúlyi ár nem változik', en: 'The equilibrium price does not change' },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd2-08',
    hu: 'Ha a kereslet nő, de a kínálat nem változik, mi lesz az egyensúlyi árral?',
    en: 'If demand increases but supply stays the same, what happens to the equilibrium price?',
    options: [
      { hu: 'Csökken', en: 'It falls' },
      { hu: 'Nem változik', en: 'It stays the same' },
      { hu: 'Nő', en: 'It rises' },
      { hu: 'Nulla lesz', en: 'It becomes zero' },
    ],
    correctIndex: 2,
  },
]

// ---------------------------------------------------------------------------
// Level 3 — Beavatkozások / Interventions (8 questions)
// ---------------------------------------------------------------------------

export const SD_LEVEL3_QUIZ: QuizQuestion[] = [
  {
    id: 'sd3-01',
    hu: 'Mit okoz egy kötelező árplafon (maximum ár), ha az egyensúlyi ár alá kerül?',
    en: 'What does a binding price ceiling cause when set below the equilibrium price?',
    options: [
      { hu: 'Árutöbbletet (felesleget)', en: 'A commodity surplus' },
      { hu: 'Áru-hiányt', en: 'A commodity shortage' },
      { hu: 'Az egyensúly változatlan marad', en: 'Equilibrium remains unchanged' },
      { hu: 'A termelők profitja nő', en: "Producers' profit increases" },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd3-02',
    hu: 'Mit okoz egy kötelező árpadló (minimum ár), ha az egyensúlyi ár fölé kerül?',
    en: 'What does a binding price floor cause when set above the equilibrium price?',
    options: [
      { hu: 'Áru-hiányt', en: 'A commodity shortage' },
      { hu: 'Holtteher-veszteség nélküli egyensúlyt', en: 'An equilibrium without deadweight loss' },
      { hu: 'Árutöbbletet (felesleget)', en: 'A commodity surplus' },
      { hu: 'Megnövekedett fogyasztói többletet', en: 'Increased consumer surplus' },
    ],
    correctIndex: 2,
  },
  {
    id: 'sd3-03',
    hu: 'A bérlakás-szabályozás (rent control) melyik piaci beavatkozás példája?',
    en: 'Rent control is an example of which market intervention?',
    options: [
      { hu: 'Árpadló', en: 'Price floor' },
      { hu: 'Egységadó', en: 'Unit tax' },
      { hu: 'Árplafon', en: 'Price ceiling' },
      { hu: 'Termelési kvóta', en: 'Production quota' },
    ],
    correctIndex: 2,
  },
  {
    id: 'sd3-04',
    hu: 'A minimálbér melyik piaci beavatkozás példája?',
    en: 'The minimum wage is an example of which market intervention?',
    options: [
      { hu: 'Árplafon', en: 'Price ceiling' },
      { hu: 'Árpadló', en: 'Price floor' },
      { hu: 'Fogyasztási adó', en: 'Consumption tax' },
      { hu: 'Termelési támogatás', en: 'Production subsidy' },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd3-05',
    hu: 'Miért okoz holtteher-veszteséget egy kötelező árplafon?',
    en: 'Why does a binding price ceiling cause deadweight loss?',
    options: [
      { hu: 'Mert csökkenti az adóbevételt', en: 'Because it reduces tax revenue' },
      { hu: 'Mert kicseréli a fogyasztói és termelői többletet', en: 'Because it swaps consumer and producer surplus' },
      { hu: 'Mert a megvalósuló tranzakciók száma kisebb az egyensúlyinál', en: 'Because fewer transactions occur than at equilibrium' },
      { hu: 'Mert növeli a termelési költségeket', en: 'Because it increases production costs' },
    ],
    correctIndex: 2,
  },
  {
    id: 'sd3-06',
    hu: 'Kötelező árplafon esetén ki jár jól és ki jár rosszul?',
    en: 'With a binding price ceiling, who gains and who loses?',
    options: [
      { hu: 'Termelők nyernek, fogyasztók veszítenek', en: 'Producers gain, consumers lose' },
      { hu: 'Fogyasztók (egy része) nyernek, termelők veszítenek', en: 'Consumers (some) gain, producers lose' },
      { hu: 'Mindenki egyformán nyer', en: 'Everyone gains equally' },
      { hu: 'Az állam nyer, a magánszektor veszít', en: 'The government gains, the private sector loses' },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd3-07',
    hu: 'Kötelező árpadló esetén mekkora lesz a kereskedett mennyiség?',
    en: 'With a binding price floor, what is the traded quantity?',
    options: [
      { hu: 'Az egyensúlyi mennyiség', en: 'The equilibrium quantity' },
      { hu: 'A kínált mennyiség', en: 'The quantity supplied' },
      { hu: 'A keresett mennyiség', en: 'The quantity demanded' },
      { hu: 'A keresett és kínált mennyiség átlaga', en: 'The average of quantity demanded and supplied' },
    ],
    correctIndex: 2,
  },
  {
    id: 'sd3-08',
    hu: 'Mit mér a hiány (shortage) az árplafon esetén?',
    en: 'What does the shortage measure in the case of a price ceiling?',
    options: [
      { hu: 'A termelők veszteségét', en: "Producers' loss" },
      { hu: 'A keresett és a kínált mennyiség különbségét', en: 'The difference between quantity demanded and quantity supplied' },
      { hu: 'A holtteher-veszteséget', en: 'The deadweight loss' },
      { hu: 'A fogyasztói többlet csökkenését', en: 'The decrease in consumer surplus' },
    ],
    correctIndex: 1,
  },
]

// ---------------------------------------------------------------------------
// Level 4 — Jóléti hatások / Welfare Effects & Taxes (8 questions)
// ---------------------------------------------------------------------------

export const SD_LEVEL4_QUIZ: QuizQuestion[] = [
  {
    id: 'sd4-01',
    hu: 'Egy egységadó (unit tax) terhét ki viseli?',
    en: 'Who bears the burden of a unit tax?',
    options: [
      { hu: 'Mindig csak a vevő', en: 'Always only the buyer' },
      { hu: 'Mindig csak az eladó', en: 'Always only the seller' },
      { hu: 'Mindkettő — az arány a rugalmasságtól függ', en: 'Both — the ratio depends on elasticity' },
      { hu: 'Az állam viseli a terhet', en: 'The government bears the burden' },
    ],
    correctIndex: 2,
  },
  {
    id: 'sd4-02',
    hu: 'Ha a kereslet tökéletesen rugalmatlan (meredek), ki viseli az adóterhet?',
    en: 'If demand is perfectly inelastic (vertical), who bears the tax burden?',
    options: [
      { hu: 'Teljes egészében az eladók', en: 'Entirely the sellers' },
      { hu: 'Felezve a vevők és eladók között', en: 'Split evenly between buyers and sellers' },
      { hu: 'Teljes egészében a vevők', en: 'Entirely the buyers' },
      { hu: 'Az állam', en: 'The government' },
    ],
    correctIndex: 2,
  },
  {
    id: 'sd4-03',
    hu: 'Ha a kínálat tökéletesen rugalmas (vízszintes), ki viseli az adóterhet?',
    en: 'If supply is perfectly elastic (horizontal), who bears the tax burden?',
    options: [
      { hu: 'Teljes egészében a vevők', en: 'Entirely the buyers' },
      { hu: 'Teljes egészében az eladók', en: 'Entirely the sellers' },
      { hu: 'Felezve a vevők és eladók között', en: 'Split evenly between buyers and sellers' },
      { hu: 'Senki — az adó nem számít', en: 'Nobody — the tax does not matter' },
    ],
    correctIndex: 0,
  },
  {
    id: 'sd4-04',
    hu: 'Mit okoz az egységadó a fogyasztói és termelői többletnek?',
    en: 'What does a unit tax do to consumer and producer surplus?',
    options: [
      { hu: 'Mindkettőt növeli', en: 'It increases both' },
      { hu: 'Mindkettőt csökkenti', en: 'It decreases both' },
      { hu: 'A fogyasztói többletet növeli, a termelőit csökkenti', en: 'It increases consumer surplus and decreases producer surplus' },
      { hu: 'Nem érinti egyiket sem', en: 'It affects neither' },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd4-05',
    hu: 'Miből adódik az adó okozta holtteher-veszteség?',
    en: 'What causes the deadweight loss from a tax?',
    options: [
      { hu: 'Az adóbevételből, amelyet az állam félrepazarol', en: 'Tax revenue wasted by the government' },
      { hu: 'Azon tranzakciókból, amelyek az adó nélkül megvalósultak volna, de az adóval nem', en: 'Transactions that would have occurred without the tax but do not with it' },
      { hu: 'A fogyasztói többlet csökkentéséből', en: 'The reduction in consumer surplus' },
      { hu: 'Az áremelkedésből', en: 'The price increase' },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd4-06',
    hu: 'Hogyan változik a holtteher-veszteség, ha az adó mértéke megduplázódik?',
    en: 'How does deadweight loss change if the tax rate doubles?',
    options: [
      { hu: 'Megduplázódik', en: 'It doubles' },
      { hu: 'Megnégyszereződik', en: 'It quadruples' },
      { hu: 'Nem változik', en: 'It does not change' },
      { hu: 'Felére csökken', en: 'It halves' },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd4-07',
    hu: 'Mit mond a Laffer-görbe?',
    en: 'What does the Laffer curve say?',
    options: [
      { hu: 'Az adóbevétel mindig nő az adókulcs emelésével', en: 'Tax revenue always increases as the tax rate rises' },
      { hu: 'Létezik egy adókulcs, amely felett az adóbevétel csökkeni kezd', en: 'There is a tax rate beyond which revenue begins to fall' },
      { hu: 'A nulla adókulcs maximalizálja a bevételt', en: 'A zero tax rate maximizes revenue' },
      { hu: 'Az adóbevétel független az adókulcstól', en: 'Tax revenue is independent of the tax rate' },
    ],
    correctIndex: 1,
  },
  {
    id: 'sd4-08',
    hu: 'Mikor a legnagyobb az adóbevétel a holtteher-veszteséghez képest (leghatékonyabb adó)?',
    en: 'When is tax revenue largest relative to deadweight loss (most efficient tax)?',
    options: [
      { hu: 'Ha nagyon rugalmas a kereslet és a kínálat', en: 'If demand and supply are very elastic' },
      { hu: 'Ha nagyon rugalmatlan (meredek) a kereslet és/vagy a kínálat', en: 'If demand and/or supply is very inelastic (steep)' },
      { hu: 'Ha az adókulcs nagyon magas', en: 'If the tax rate is very high' },
      { hu: 'Ha az adókulcs nulla', en: 'If the tax rate is zero' },
    ],
    correctIndex: 1,
  },
]

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

export function pickQuestions(pool: QuizQuestion[], n = 3): QuizQuestion[] {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, n)
}
