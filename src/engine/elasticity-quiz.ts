import type { QuizQuestion } from './quiz'
export { pickQuestions } from './quiz'

export const ELASTICITY_LEVEL1_QUIZ: QuizQuestion[] = [
  {
    id: 'el1q1',
    hu: 'Ha |PED| = 2 és az ár 10%-ot nő, a kereslet...',
    en: 'If |PED| = 2 and price rises 10%, demand...',
    options: [
      { hu: '-20%-ot változik', en: 'changes by -20%' },
      { hu: '-2%-ot változik', en: 'changes by -2%' },
      { hu: '+20%-ot változik', en: 'changes by +20%' },
      { hu: 'nem változik', en: 'does not change' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el1q2',
    hu: 'Mikor rugalmas igazán a kereslet?',
    en: 'When is demand truly elastic?',
    options: [
      { hu: 'Ha sok helyettesítő létezik', en: 'If many substitutes exist' },
      { hu: 'Ha az ár nagyon magas', en: 'If the price is very high' },
      { hu: 'Ha a termék szükséglet', en: 'If the product is a necessity' },
      { hu: 'Ha a kereslet alacsony', en: 'If demand is low' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el1q3',
    hu: 'Rugalmatlan keresletnél az áremelés a bevételre...',
    en: 'With inelastic demand, a price increase on revenue...',
    options: [
      { hu: 'Növeli', en: 'Increases it' },
      { hu: 'Csökkenti', en: 'Decreases it' },
      { hu: 'Nem változtatja meg', en: 'Does not change it' },
      { hu: 'Megduplázza', en: 'Doubles it' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el1q4',
    hu: 'Mi a PED képlete?',
    en: 'What is the formula for PED?',
    options: [
      { hu: 'ΔQ% / ΔP%', en: 'ΔQ% / ΔP%' },
      { hu: 'ΔP% / ΔQ%', en: 'ΔP% / ΔQ%' },
      { hu: 'ΔQ / ΔP', en: 'ΔQ / ΔP' },
      { hu: 'P / Q', en: 'P / Q' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el1q5',
    hu: 'Melyik terméknek legkisebb valószínűleg a |PED|?',
    en: 'Which product most likely has the smallest |PED|?',
    options: [
      { hu: 'Inzulin', en: 'Insulin' },
      { hu: 'iPhone', en: 'iPhone' },
      { hu: 'Starbucks kávé', en: 'Starbucks coffee' },
      { hu: 'Üdítő', en: 'Soft drink' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el1q6',
    hu: 'Egységrugalmas keresletnél áremelés hatása a bevételre?',
    en: 'With unit elastic demand, what happens to revenue when price rises?',
    options: [
      { hu: 'Nem változik', en: 'Does not change' },
      { hu: 'Nő', en: 'Increases' },
      { hu: 'Csökken', en: 'Decreases' },
      { hu: 'Megkétszereződik', en: 'Doubles' },
    ],
    correctIndex: 0,
  },
]

export const ELASTICITY_LEVEL2_QUIZ: QuizQuestion[] = [
  {
    id: 'el2q1',
    hu: 'Miért rugalmatlanabb a kínálat rövid távon?',
    en: 'Why is supply less elastic in the short run?',
    options: [
      { hu: 'Kapacitást nem lehet azonnal bővíteni', en: 'Capacity cannot be expanded immediately' },
      { hu: 'Az árak alacsonyak', en: 'Prices are low' },
      { hu: 'Nincs elég kereslet', en: 'There is not enough demand' },
      { hu: 'A termelők nem akarnak több termelni', en: 'Producers do not want to produce more' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el2q2',
    hu: 'Melyik iparág kínálata leginkább rugalmas rövid távon?',
    en: 'Which industry has the most elastic supply in the short run?',
    options: [
      { hu: 'Szoftver', en: 'Software' },
      { hu: 'Búza', en: 'Wheat' },
      { hu: 'Koncertterem', en: 'Concert hall' },
      { hu: 'Napelem', en: 'Solar panel' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el2q3',
    hu: 'Tökéletesen rugalmatlan kínálat esetén a kínálati görbe...?',
    en: 'With perfectly inelastic supply, the supply curve is...?',
    options: [
      { hu: 'Függőleges', en: 'Vertical' },
      { hu: 'Vízszintes', en: 'Horizontal' },
      { hu: 'Pozitív meredekségű', en: 'Positively sloped' },
      { hu: 'Negatív meredekségű', en: 'Negatively sloped' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el2q4',
    hu: 'Mi a PES képlete?',
    en: 'What is the formula for PES?',
    options: [
      { hu: 'ΔQ% / ΔP%', en: 'ΔQ% / ΔP%' },
      { hu: 'ΔP% / ΔQ%', en: 'ΔP% / ΔQ%' },
      { hu: 'ΔQ / ΔP', en: 'ΔQ / ΔP' },
      { hu: 'P × Q', en: 'P × Q' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el2q5',
    hu: 'Ha PES = 0, az azt jelenti, hogy...?',
    en: 'If PES = 0, it means that...?',
    options: [
      { hu: 'Az ár változása nem hat a kínált mennyiségre', en: 'Price changes do not affect quantity supplied' },
      { hu: 'A kínálat végtelen rugalmas', en: 'Supply is infinitely elastic' },
      { hu: 'Az ár nem változik', en: 'Price does not change' },
      { hu: 'A termelési költség nulla', en: 'Production cost is zero' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el2q6',
    hu: 'Hosszú távon miért rugalmasabb a kínálat?',
    en: 'Why is supply more elastic in the long run?',
    options: [
      { hu: 'Új termelők léphetnek be, kapacitás bővülhet', en: 'New producers can enter, capacity can expand' },
      { hu: 'Az árak csökkennek', en: 'Prices fall' },
      { hu: 'A kereslet nő', en: 'Demand increases' },
      { hu: 'Az állam szabályoz', en: 'The government regulates' },
    ],
    correctIndex: 0,
  },
]

export const ELASTICITY_LEVEL3_QUIZ: QuizQuestion[] = [
  {
    id: 'el3q1',
    hu: 'Ha XED > 0, a két termék...?',
    en: 'If XED > 0, the two products are...?',
    options: [
      { hu: 'Helyettesítő', en: 'Substitutes' },
      { hu: 'Komplementer', en: 'Complements' },
      { hu: 'Független', en: 'Independent' },
      { hu: 'Inferior', en: 'Inferior' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el3q2',
    hu: 'Ha XED < 0, a két termék...?',
    en: 'If XED < 0, the two products are...?',
    options: [
      { hu: 'Komplementer', en: 'Complements' },
      { hu: 'Helyettesítő', en: 'Substitutes' },
      { hu: 'Független', en: 'Independent' },
      { hu: 'Luxus', en: 'Luxury' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el3q3',
    hu: 'A Pepsi ára nő 15%-ot, a Coca-Cola kereslete nő 9%-ot. XED = ?',
    en: 'Pepsi price rises 15%, Coca-Cola demand rises 9%. XED = ?',
    options: [
      { hu: '+0.6', en: '+0.6' },
      { hu: '-0.6', en: '-0.6' },
      { hu: '+1.67', en: '+1.67' },
      { hu: '-1.67', en: '-1.67' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el3q4',
    hu: 'Az autó ára nő. Hogyan változik a benzin kereslete?',
    en: 'Car price rises. How does petrol demand change?',
    options: [
      { hu: 'Csökken (komplementer)', en: 'Decreases (complement)' },
      { hu: 'Nő (helyettesítő)', en: 'Increases (substitute)' },
      { hu: 'Nem változik', en: 'Does not change' },
      { hu: 'Megduplázódik', en: 'Doubles' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el3q5',
    hu: 'Ha XED ≈ 0, a két termék...?',
    en: 'If XED ≈ 0, the two products are...?',
    options: [
      { hu: 'Független', en: 'Independent' },
      { hu: 'Helyettesítő', en: 'Substitutes' },
      { hu: 'Komplementer', en: 'Complements' },
      { hu: 'Inferior', en: 'Inferior' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el3q6',
    hu: 'Az Apple miért árulja olcsón az AirPodst?',
    en: 'Why does Apple sell AirPods cheaply?',
    options: [
      { hu: 'Mert az iPhone-nal komplementer — olcsóbb AirPods → több iPhone eladás', en: 'Because it complements iPhone — cheaper AirPods → more iPhone sales' },
      { hu: 'Mert az AirPods gyártása olcsó', en: 'Because AirPods are cheap to manufacture' },
      { hu: 'Mert a vevők nem fizetnek többet', en: 'Because buyers will not pay more' },
      { hu: 'Mert az Android-felhasználókat célozzák', en: 'Because they target Android users' },
    ],
    correctIndex: 0,
  },
]

export const ELASTICITY_LEVEL4_QUIZ: QuizQuestion[] = [
  {
    id: 'el4q1',
    hu: 'Ha YED < 0, a jószág...?',
    en: 'If YED < 0, the good is...?',
    options: [
      { hu: 'Inferior (alacsonyabb rendű)', en: 'Inferior (lower-grade)' },
      { hu: 'Normál', en: 'Normal' },
      { hu: 'Luxus', en: 'Luxury' },
      { hu: 'Helyettesítő', en: 'Substitute' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el4q2',
    hu: 'Luxuscikknél YED értéke...?',
    en: 'For a luxury good, YED is...?',
    options: [
      { hu: 'Nagyobb mint 1', en: 'Greater than 1' },
      { hu: '0 és 1 között', en: 'Between 0 and 1' },
      { hu: 'Negatív', en: 'Negative' },
      { hu: 'Pontosan 1', en: 'Exactly 1' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el4q3',
    hu: 'A jövedelem 10%-ot nő, az éttermi étkezések 18%-ot nőnek. YED = ?',
    en: 'Income rises 10%, restaurant meals rise 18%. YED = ?',
    options: [
      { hu: '+1.8', en: '+1.8' },
      { hu: '-1.8', en: '-1.8' },
      { hu: '+0.55', en: '+0.55' },
      { hu: '+28', en: '+28' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el4q4',
    hu: 'Inferior jószágnál a jövedelem növekedése...',
    en: 'For an inferior good, rising income...',
    options: [
      { hu: 'Csökkenti a keresletet', en: 'Decreases demand' },
      { hu: 'Növeli a keresletet', en: 'Increases demand' },
      { hu: 'Nem változtatja meg', en: 'Does not change it' },
      { hu: 'Megkétszerezi', en: 'Doubles it' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el4q5',
    hu: 'Melyik a legjobb példa inferior jószágra?',
    en: 'Which is the best example of an inferior good?',
    options: [
      { hu: 'Instant tészta', en: 'Instant noodles' },
      { hu: 'Hermès táska', en: 'Hermès bag' },
      { hu: '1. osztályú repülőjegy', en: 'First-class flight ticket' },
      { hu: 'Tengeri hal', en: 'Seafood' },
    ],
    correctIndex: 0,
  },
  {
    id: 'el4q6',
    hu: 'Mire utal, ha egy iparág forgalma csökken, miközben az ország gazdagszik?',
    en: 'What does it indicate if an industry\'s revenue falls while the country gets richer?',
    options: [
      { hu: 'Az iparág terméke inferior jószág', en: 'The industry\'s product is an inferior good' },
      { hu: 'Az iparág terméke luxuscikk', en: 'The industry\'s product is a luxury good' },
      { hu: 'A kereslet rugalmatlan', en: 'Demand is inelastic' },
      { hu: 'Az árak nőttek', en: 'Prices have risen' },
    ],
    correctIndex: 0,
  },
]
