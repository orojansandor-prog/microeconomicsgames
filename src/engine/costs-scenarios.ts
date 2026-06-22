// costs-scenarios.ts
// 5 randomized cost scenarios for the "Vállalati költségek" game.

export interface CostItem {
  id: string
  hu: string
  en: string
  correct: 'fix' | 'valtozo'
}

export interface CostRow {
  Q: number
  TC: number
  FC: number
  VC: number
  MC: number | null
  ATC: number | null
  AVC: number | null
  AFC: number | null
}

export interface CostScenario {
  id: string
  icon: string
  titleHu: string
  titleEn: string
  storyHu: string
  storyEn: string
  productHu: string
  productEn: string
  FC: number
  schedule: CostRow[]
  minMC: number
  qMinMC: number
  minAVC: number
  qMinAVC: number
  minATC: number
  qMinATC: number
  costItems: CostItem[]
  hintAnchorRows: number[]
  /** Market price to use in Level 4 (chosen so optimal Q = 8) */
  marketPrice: number
  /** Optimal Q at marketPrice (always 8) */
  optimalQ: number
}

export function pickCostRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function r2(x: number): number {
  return Math.round(x * 10) / 10
}

function buildSchedule(tcValues: number[], fc: number): CostRow[] {
  return tcValues.map((tc, q) => {
    const vc = tc - fc
    const mc = q === 0 ? null : r2(tc - tcValues[q - 1])
    const atc = q === 0 ? null : r2(tc / q)
    const avc = q === 0 ? null : r2(vc / q)
    const afc = q === 0 ? null : r2(fc / q)
    return { Q: q, TC: tc, FC: fc, VC: vc, MC: mc, ATC: atc, AVC: avc, AFC: afc }
  })
}

// ── Scenario 1: Pékség ──────────────────────────────────────────────────────
const bakeryTC = [100, 150, 190, 220, 244, 265, 292, 331, 388, 469, 580]
const bakerySchedule = buildSchedule(bakeryTC, 100)

const BAKERY_SCENARIO: CostScenario = {
  id: 'bakery',
  icon: '🥖',
  titleHu: 'A pékség megnyílt!',
  titleEn: 'The bakery opens!',
  storyHu: 'Bérleti díj és kemence: 100 Ft/nap — megnyisd vagy sem, ezt fizetni kell. Liszt, tojás, munkabér: annál több, minél több kenyeret sütsz.',
  storyEn: 'Rent and oven: 100 Ft/day — whether you open or not. Flour, eggs, wages: more if you bake more.',
  productHu: 'kosár kenyér',
  productEn: 'bread basket',
  FC: 100,
  schedule: bakerySchedule,
  minMC: 21,
  qMinMC: 5,
  minAVC: 32,
  qMinAVC: 6,
  minATC: 47.3,
  qMinATC: 7,
  costItems: [
    { id: 'rent',      hu: 'Bérleti díj',        en: 'Rent',             correct: 'fix' },
    { id: 'oven',      hu: 'Kemence törlesztés',  en: 'Oven payment',     correct: 'fix' },
    { id: 'flour',     hu: 'Lisztköltség',        en: 'Flour cost',       correct: 'valtozo' },
    { id: 'wage',      hu: 'Munkabér (órabér)',   en: 'Hourly wages',     correct: 'valtozo' },
    { id: 'insurance', hu: 'Biztosítás',          en: 'Insurance',        correct: 'fix' },
    { id: 'packaging', hu: 'Csomagoló anyag',     en: 'Packaging',        correct: 'valtozo' },
  ],
  hintAnchorRows: [0, 3, 10],
  marketPrice: 69,
  optimalQ: 8,
}

// ── Scenario 2: Pizzéria ────────────────────────────────────────────────────
const pizzeriaTC = [120, 180, 228, 264, 292, 316, 348, 392, 452, 536, 660]
const pizzeriaSchedule = buildSchedule(pizzeriaTC, 120)

const PIZZERIA_SCENARIO: CostScenario = {
  id: 'pizzeria',
  icon: '🍕',
  titleHu: 'Nyitottál egy pizzériát!',
  titleEn: 'You opened a pizzeria!',
  storyHu: 'Bérleti díj és pizzakemence: 120 Ft/nap — ezek állandóak. Paradicsomos alap, sajt, munkabér: annál többe kerül, minél több pizzát sütsz.',
  storyEn: 'Rent and pizza oven: 120 Ft/day — fixed regardless. Tomato base, cheese, wages: more cost with more pizzas.',
  productHu: 'pizza',
  productEn: 'pizza',
  FC: 120,
  schedule: pizzeriaSchedule,
  minMC: 24,
  qMinMC: 5,
  minAVC: 38,
  qMinAVC: 6,
  minATC: 56,
  qMinATC: 7,
  costItems: [
    { id: 'rent',      hu: 'Bérleti díj',                  en: 'Rent',                 correct: 'fix' },
    { id: 'oven',      hu: 'Pizzakemence törlesztés',       en: 'Pizza oven payment',   correct: 'fix' },
    { id: 'tomato',    hu: 'Paradicsomos alap',             en: 'Tomato base',          correct: 'valtozo' },
    { id: 'wage',      hu: 'Munkabér',                     en: 'Wages',                correct: 'valtozo' },
    { id: 'insurance', hu: 'Biztosítás',                   en: 'Insurance',            correct: 'fix' },
    { id: 'packaging', hu: 'Csomagoló anyag',              en: 'Packaging',            correct: 'valtozo' },
  ],
  hintAnchorRows: [0, 3, 10],
  marketPrice: 72,
  optimalQ: 8,
}

// ── Scenario 3: Kávézó ──────────────────────────────────────────────────────
const cafeTC = [80, 124, 158, 184, 204, 220, 242, 274, 324, 402, 518]
const cafeSchedule = buildSchedule(cafeTC, 80)

const CAFE_SCENARIO: CostScenario = {
  id: 'cafe',
  icon: '☕',
  titleHu: 'Kávézó a belvárosban!',
  titleEn: 'A city-centre café!',
  storyHu: 'Bérleti díj és kávégép: 80 Ft/nap — ezek állandóak. Kávébab, cukor, barista bére: annál több, minél több pohár kávét készítesz.',
  storyEn: 'Rent and espresso machine: 80 Ft/day — fixed. Coffee beans, sugar, barista wages: more with more cups.',
  productHu: 'kávé',
  productEn: 'coffee',
  FC: 80,
  schedule: cafeSchedule,
  minMC: 16,
  qMinMC: 5,
  minAVC: 27,
  qMinAVC: 6,
  minATC: 39.1,
  qMinATC: 7,
  costItems: [
    { id: 'rent',      hu: 'Bérleti díj',              en: 'Rent',                         correct: 'fix' },
    { id: 'machine',   hu: 'Kávégép törlesztés',       en: 'Espresso machine payment',     correct: 'fix' },
    { id: 'beans',     hu: 'Kávébab',                  en: 'Coffee beans',                 correct: 'valtozo' },
    { id: 'wage',      hu: 'Barista bére',              en: 'Barista wage',                 correct: 'valtozo' },
    { id: 'insurance', hu: 'Biztosítás',               en: 'Insurance',                    correct: 'fix' },
    { id: 'cups',      hu: 'Poharak, csomagolás',      en: 'Cups and packaging',           correct: 'valtozo' },
  ],
  hintAnchorRows: [0, 3, 10],
  marketPrice: 64,
  optimalQ: 8,
}

// ── Scenario 4: Pólónyomda ──────────────────────────────────────────────────
const tshirtTC = [150, 220, 278, 324, 360, 390, 426, 474, 542, 640, 780]
const tshirtSchedule = buildSchedule(tshirtTC, 150)

const TSHIRT_SCENARIO: CostScenario = {
  id: 'tshirt',
  icon: '👕',
  titleHu: 'Pólónyomda a városban!',
  titleEn: 'A T-shirt print shop!',
  storyHu: 'Bérleti díj és nyomógép: 150 Ft/nap — ezek állandóak. Anyagköltség, festék, munkabér: annál több, minél több pólót nyomtatol.',
  storyEn: 'Rent and printing machine: 150 Ft/day — fixed. Material, ink, wages: more with more T-shirts.',
  productHu: 'póló',
  productEn: 'T-shirt',
  FC: 150,
  schedule: tshirtSchedule,
  minMC: 30,
  qMinMC: 5,
  minAVC: 46,
  qMinAVC: 6,
  minATC: 67.7,
  qMinATC: 7,
  costItems: [
    { id: 'rent',      hu: 'Bérleti díj',              en: 'Rent',                         correct: 'fix' },
    { id: 'printer',   hu: 'Nyomógép törlesztés',      en: 'Printing machine payment',     correct: 'fix' },
    { id: 'material',  hu: 'Anyagköltség (szövet)',    en: 'Material cost (fabric)',        correct: 'valtozo' },
    { id: 'wage',      hu: 'Munkabér',                 en: 'Wages',                        correct: 'valtozo' },
    { id: 'insurance', hu: 'Biztosítás',               en: 'Insurance',                    correct: 'fix' },
    { id: 'packaging', hu: 'Csomagoló anyag',          en: 'Packaging',                    correct: 'valtozo' },
  ],
  hintAnchorRows: [0, 3, 10],
  marketPrice: 83,
  optimalQ: 8,
}

// ── Scenario 5: Fagylaltozó ─────────────────────────────────────────────────
const icecreamTC = [60, 96, 124, 146, 164, 180, 200, 228, 268, 328, 420]
const icecreamSchedule = buildSchedule(icecreamTC, 60)

const ICECREAM_SCENARIO: CostScenario = {
  id: 'icecream',
  icon: '🍦',
  titleHu: 'Fagylaltozó a főtéren!',
  titleEn: 'An ice cream shop on the main square!',
  storyHu: 'Bérleti díj és fagyasztók: 60 Ft/nap — ezek állandóak. Tejszín, ízesítők, munkabér: annál több, minél több gombócot kínálsz.',
  storyEn: 'Rent and freezers: 60 Ft/day — fixed. Cream, flavourings, wages: more with more scoops.',
  productHu: 'fagylalt gombóc',
  productEn: 'ice cream scoop',
  FC: 60,
  schedule: icecreamSchedule,
  minMC: 16,
  qMinMC: 5,
  minAVC: 23.3,
  qMinAVC: 6,
  minATC: 32.6,
  qMinATC: 7,
  costItems: [
    { id: 'rent',      hu: 'Bérleti díj',              en: 'Rent',                         correct: 'fix' },
    { id: 'freezer',   hu: 'Fagyasztók törlesztése',   en: 'Freezer payment',              correct: 'fix' },
    { id: 'cream',     hu: 'Tejszín és ízesítők',      en: 'Cream and flavourings',        correct: 'valtozo' },
    { id: 'wage',      hu: 'Munkabér',                 en: 'Wages',                        correct: 'valtozo' },
    { id: 'insurance', hu: 'Biztosítás',               en: 'Insurance',                    correct: 'fix' },
    { id: 'cones',     hu: 'Tölcsérek, poharak',       en: 'Cones and cups',               correct: 'valtozo' },
  ],
  hintAnchorRows: [0, 3, 10],
  marketPrice: 50,
  optimalQ: 8,
}

export const COST_SCENARIOS: CostScenario[] = [
  BAKERY_SCENARIO,
  PIZZERIA_SCENARIO,
  CAFE_SCENARIO,
  TSHIRT_SCENARIO,
  ICECREAM_SCENARIO,
]
