/**
 * Elasticity scenarios — deterministic data, no LLM
 */

export interface PEDProduct {
  id: string
  emoji: string
  huName: string
  enName: string
  deltaP_pct: number
  deltaQ_pct: number
  ped: number
  trDirection: 'up' | 'down' | 'same'
  explanationHu: string
  explanationEn: string
}

export interface PEDScenario {
  id: string
  contextHu: string
  contextEn: string
  products: PEDProduct[]
}

export interface PESIndustry {
  id: string
  emoji: string
  huName: string
  enName: string
  shortRunPES: number
  longRunPES: number
  explanationHu: string
  explanationEn: string
}

export interface PESScenario {
  id: string
  contextHu: string
  contextEn: string
  industries: PESIndustry[]
}

export interface XEDPair {
  id: string
  emojiA: string
  huNameA: string
  enNameA: string
  emojiB: string
  huNameB: string
  enNameB: string
  deltaPA: number
  deltaQB: number
  xed: number
  type: 'substitute' | 'complement' | 'independent'
  explanationHu: string
  explanationEn: string
}

export interface XEDScenario {
  id: string
  contextHu: string
  contextEn: string
  pairs: XEDPair[]
}

export interface YEDProduct {
  id: string
  emoji: string
  huName: string
  enName: string
  deltaQ_pct: number
  yed: number
  type: 'luxury' | 'normal' | 'inferior'
  explanationHu: string
  explanationEn: string
}

export interface YEDScenario {
  id: string
  contextHu: string
  contextEn: string
  deltaY_pct: number
  products: YEDProduct[]
}

// ── PED Products (shared across scenarios) ──────────────────────────────────

export const PED_PRODUCTS: PEDProduct[] = [
  {
    id: 'benzin',
    emoji: '⛽',
    huName: 'Benzin',
    enName: 'Petrol',
    deltaP_pct: 10,
    deltaQ_pct: -3,
    ped: -0.3,
    trDirection: 'up',
    explanationHu: 'Kevés helyettesítő, szükségleti cikk',
    explanationEn: 'Few substitutes, necessity',
  },
  {
    id: 'iphone',
    emoji: '📱',
    huName: 'iPhone',
    enName: 'iPhone',
    deltaP_pct: 10,
    deltaQ_pct: -18,
    ped: -1.8,
    trDirection: 'down',
    explanationHu: 'Sok alternatíva (Android), luxus',
    explanationEn: 'Many alternatives (Android), luxury',
  },
  {
    id: 'kenyer',
    emoji: '🍞',
    huName: 'Kenyér',
    enName: 'Bread',
    deltaP_pct: 10,
    deltaQ_pct: -5,
    ped: -0.5,
    trDirection: 'up',
    explanationHu: 'Alapélelmiszer, kevés helyettesítő',
    explanationEn: 'Staple food, few substitutes',
  },
  {
    id: 'starbucks',
    emoji: '☕',
    huName: 'Starbucks kávé',
    enName: 'Starbucks coffee',
    deltaP_pct: 10,
    deltaQ_pct: -22,
    ped: -2.2,
    trDirection: 'down',
    explanationHu: 'Luxus, sok kávézó alternatíva',
    explanationEn: 'Luxury, many café alternatives',
  },
  {
    id: 'inzulin',
    emoji: '💉',
    huName: 'Inzulin',
    enName: 'Insulin',
    deltaP_pct: 10,
    deltaQ_pct: -1,
    ped: -0.1,
    trDirection: 'up',
    explanationHu: 'Életmentő gyógyszer, nincs helyettesítő',
    explanationEn: 'Life-saving drug, no substitute',
  },
  {
    id: 'udito',
    emoji: '🥤',
    huName: 'Üdítő',
    enName: 'Soft drink',
    deltaP_pct: 10,
    deltaQ_pct: -15,
    ped: -1.5,
    trDirection: 'down',
    explanationHu: 'Luxus, sok márka helyettesíti',
    explanationEn: 'Luxury, many brands substitute',
  },
]

// ── PED Scenarios ────────────────────────────────────────────────────────────

export const PED_SCENARIOS: PEDScenario[] = [
  {
    id: 'ped_analyst',
    contextHu: 'Piacelemzőként 6 fogyasztási cikk piacát vizsgálod. Az árak általánosan 10%-ot emelkedtek. Melyik termék kereslete rugalmas, és melyiké rugalmatlan?',
    contextEn: 'As a market analyst, you study 6 consumer goods markets. Prices rose uniformly by 10%. Which product demand is elastic, and which is inelastic?',
    products: PED_PRODUCTS,
  },
  {
    id: 'ped_retailer',
    contextHu: 'Kiskereskedőként döntened kell: melyik termékek árát emeld 10%-kal úgy, hogy a bevételed nőjön? Sorold be a termékeket!',
    contextEn: 'As a retailer, you must decide: which products to raise prices by 10% so revenue increases? Classify the products!',
    products: PED_PRODUCTS,
  },
]

// ── PES Scenario ─────────────────────────────────────────────────────────────

export const PES_SCENARIO: PESScenario = {
  id: 'pes_main',
  contextHu: 'Az árak 20%-ot emelkedtek ezekben az iparágakban. Becsüld meg a kínálat rugalmasságát rövid és hosszú távon!',
  contextEn: 'Prices rose by 20% in these industries. Estimate the elasticity of supply in the short run and long run!',
  industries: [
    {
      id: 'buza',
      emoji: '🌾',
      huName: 'Búza',
      enName: 'Wheat',
      shortRunPES: 0.2,
      longRunPES: 0.9,
      explanationHu: 'Vetésterület bővítés időigényes',
      explanationEn: 'Expanding farmland takes time',
    },
    {
      id: 'szoftver',
      emoji: '💻',
      huName: 'Szoftver',
      enName: 'Software',
      shortRunPES: 8.0,
      longRunPES: 12.0,
      explanationHu: 'Digitális termék, határköltség ~0',
      explanationEn: 'Digital product, ~0 marginal cost',
    },
    {
      id: 'koncertterem',
      emoji: '🎭',
      huName: 'Koncertterem',
      enName: 'Concert hall',
      shortRunPES: 0.0,
      longRunPES: 0.1,
      explanationHu: 'Fix kapacitáskorlát',
      explanationEn: 'Fixed capacity constraint',
    },
    {
      id: 'etterem',
      emoji: '🍽️',
      huName: 'Étterem',
      enName: 'Restaurant',
      shortRunPES: 0.5,
      longRunPES: 2.5,
      explanationHu: 'Új helyszín nyitása hónapokig tart',
      explanationEn: 'Opening new location takes months',
    },
    {
      id: 'napelem',
      emoji: '☀️',
      huName: 'Napelem',
      enName: 'Solar panel',
      shortRunPES: 0.3,
      longRunPES: 3.0,
      explanationHu: 'Gyárépítés 2-3 éves ciklus',
      explanationEn: 'Factory construction 2-3 year cycle',
    },
  ],
}

// ── XED Scenario ─────────────────────────────────────────────────────────────

export const XED_SCENARIO: XEDScenario = {
  id: 'xed_main',
  contextHu: 'Vizsgáld meg, hogyan hatnak egymásra a termékpárok árai és keresletei!',
  contextEn: 'Examine how the prices and demands of product pairs interact!',
  pairs: [
    {
      id: 'pepsi_coke',
      emojiA: '🥤',
      huNameA: 'Pepsi',
      enNameA: 'Pepsi',
      emojiB: '🍶',
      huNameB: 'Coca-Cola',
      enNameB: 'Coca-Cola',
      deltaPA: 15,
      deltaQB: 9,
      xed: 0.6,
      type: 'substitute',
      explanationHu: 'Közel azonos termékek',
      explanationEn: 'Near-identical products',
    },
    {
      id: 'auto_benzin',
      emojiA: '🚗',
      huNameA: 'Autó',
      enNameA: 'Car',
      emojiB: '⛽',
      huNameB: 'Benzin',
      enNameB: 'Petrol',
      deltaPA: 20,
      deltaQB: -8,
      xed: -0.4,
      type: 'complement',
      explanationHu: 'Autóhoz benzin kell',
      explanationEn: 'Car needs petrol',
    },
    {
      id: 'kenyer_vaj',
      emojiA: '🍞',
      huNameA: 'Kenyér',
      enNameA: 'Bread',
      emojiB: '🧈',
      huNameB: 'Vaj',
      enNameB: 'Butter',
      deltaPA: 10,
      deltaQB: -1.5,
      xed: -0.15,
      type: 'complement',
      explanationHu: 'Együtt fogyasztják',
      explanationEn: 'Consumed together',
    },
    {
      id: 'netflix_mozi',
      emojiA: '🎬',
      huNameA: 'Netflix',
      enNameA: 'Netflix',
      emojiB: '🎥',
      huNameB: 'Mozi',
      enNameB: 'Cinema',
      deltaPA: 25,
      deltaQB: 7.5,
      xed: 0.3,
      type: 'substitute',
      explanationHu: 'Otthoni vs. mozis filmezés',
      explanationEn: 'Home vs. cinema watching',
    },
    {
      id: 'ps_jatek',
      emojiA: '🎮',
      huNameA: 'PlayStation',
      enNameA: 'PlayStation',
      emojiB: '🕹️',
      huNameB: 'Játékszoftver',
      enNameB: 'Game software',
      deltaPA: 10,
      deltaQB: -9,
      xed: -0.9,
      type: 'complement',
      explanationHu: 'Konzol és játék egymásra utal',
      explanationEn: 'Console and game are paired',
    },
    {
      id: 'tea_kave',
      emojiA: '🍵',
      huNameA: 'Tea',
      enNameA: 'Tea',
      emojiB: '☕',
      huNameB: 'Kávé',
      enNameB: 'Coffee',
      deltaPA: 20,
      deltaQB: 5,
      xed: 0.25,
      type: 'substitute',
      explanationHu: 'Reggeli ital alternatívák',
      explanationEn: 'Breakfast drink alternatives',
    },
    {
      id: 'laptop_toll',
      emojiA: '💻',
      huNameA: 'Laptop',
      enNameA: 'Laptop',
      emojiB: '✏️',
      huNameB: 'Toll',
      enNameB: 'Pen',
      deltaPA: 15,
      deltaQB: 0.5,
      xed: 0.03,
      type: 'independent',
      explanationHu: 'Nem kapcsolódó piacok',
      explanationEn: 'Unrelated markets',
    },
    {
      id: 'buza_arany',
      emojiA: '🌾',
      huNameA: 'Búza',
      enNameA: 'Wheat',
      emojiB: '🥇',
      huNameB: 'Arany',
      enNameB: 'Gold',
      deltaPA: 10,
      deltaQB: -0.3,
      xed: -0.03,
      type: 'independent',
      explanationHu: 'Különböző piacok',
      explanationEn: 'Different markets',
    },
  ],
}

// ── YED Scenario ─────────────────────────────────────────────────────────────

export const YED_SCENARIO: YEDScenario = {
  id: 'yed_main',
  contextHu: 'A GDP/fő 15%-ot nőtt. Hogyan változik az egyes termékek kereslete?',
  contextEn: 'GDP per capita rose by 15%. How does demand for these products change?',
  deltaY_pct: 15,
  products: [
    {
      id: 'repulo',
      emoji: '✈️',
      huName: '1. osztályú repülő',
      enName: 'First class flight',
      deltaQ_pct: 36,
      yed: 2.4,
      type: 'luxury',
      explanationHu: 'Jövedelem-érzékeny prémium szolgáltatás',
      explanationEn: 'Income-sensitive premium service',
    },
    {
      id: 'buszberlet',
      emoji: '🚌',
      huName: 'Buszbérlet',
      enName: 'Bus pass',
      deltaQ_pct: -6,
      yed: -0.4,
      type: 'inferior',
      explanationHu: 'Gazdagodáskor autóra váltanak',
      explanationEn: 'People switch to cars when richer',
    },
    {
      id: 'okostv',
      emoji: '📺',
      huName: 'Okos TV',
      enName: 'Smart TV',
      deltaQ_pct: 16.5,
      yed: 1.1,
      type: 'luxury',
      explanationHu: 'Enyhén jövedelem-rugalmas fogyasztási cikk',
      explanationEn: 'Mildly income-elastic consumer good',
    },
    {
      id: 'margarin',
      emoji: '🧈',
      huName: 'Margarin',
      enName: 'Margarine',
      deltaQ_pct: -9,
      yed: -0.6,
      type: 'inferior',
      explanationHu: 'Vaj helyettesíti gazdagodáskor',
      explanationEn: 'Replaced by butter when richer',
    },
    {
      id: 'etterem_yed',
      emoji: '🍽️',
      huName: 'Éttermi étkezés',
      enName: 'Restaurant meal',
      deltaQ_pct: 27,
      yed: 1.8,
      type: 'luxury',
      explanationHu: 'Szabad jövedelem-érzékeny',
      explanationEn: 'Discretionary income sensitive',
    },
    {
      id: 'instant',
      emoji: '🍜',
      huName: 'Instant tészta',
      enName: 'Instant noodles',
      deltaQ_pct: -12,
      yed: -0.8,
      type: 'inferior',
      explanationHu: 'Jövedelem nő → főznek vagy étterembe mennek',
      explanationEn: 'Income rises → cook or dine out',
    },
    {
      id: 'hermes',
      emoji: '👜',
      huName: 'Hermès táska',
      enName: 'Hermès bag',
      deltaQ_pct: 75,
      yed: 5.0,
      type: 'luxury',
      explanationHu: 'Erős Veblen-határ közelében',
      explanationEn: 'Strong Veblen-adjacent effect',
    },
    {
      id: 'tengeri_hal',
      emoji: '🐟',
      huName: 'Tengeri hal',
      enName: 'Seafood',
      deltaQ_pct: 10.5,
      yed: 0.7,
      type: 'normal',
      explanationHu: 'Mérsékelt jövedelem-rugalmasság',
      explanationEn: 'Moderate income elasticity',
    },
  ],
}

// ── Helper ───────────────────────────────────────────────────────────────────

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
