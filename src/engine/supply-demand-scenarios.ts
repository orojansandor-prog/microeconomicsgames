// supply-demand-scenarios.ts
// Randomised scenario pools for all 4 supply-demand game levels.
// Math: Q* = (A-C)/(Bd+Bs), P* = A - Bd*Q*
// CS = 0.5*(A-P*)*Q*, PS = 0.5*(P*-C)*Q*  (for linear supply/demand)

export function pickSDRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─── LEVEL 1: Find Equilibrium ────────────────────────────────────────────────

export interface SDLevel1Scenario {
  id: string
  icon: string
  titleHu: string
  titleEn: string
  storyHu: string
  storyEn: string
  params: { A: number; Bd: number; C: number; Bs: number }
  optP: number
  optQ: number
}

export const SD_LEVEL1_SCENARIOS: SDLevel1Scenario[] = [
  {
    id: 'apple',
    icon: '🍎',
    titleHu: 'Almapiac — kisváros',
    titleEn: 'Apple Market — Small Town',
    storyHu: 'Egy kisváros almapiacán vagy a piacfelügyelő. Kereslet: P = 100 − Q. Kínálat: P = 20 + Q. Melyik áron és mennyiségnél kerül egyensúlyba a piac?',
    storyEn: 'You supervise a small town apple market. Demand: P = 100 − Q. Supply: P = 20 + Q. At what price and quantity does the market reach equilibrium?',
    params: { A: 100, Bd: 1, C: 20, Bs: 1 },
    optP: 60,
    optQ: 40,
  },
  {
    id: 'fuel',
    icon: '⛽',
    titleHu: 'Benzinkút — főút melletti piac',
    titleEn: 'Fuel Market — Roadside Station',
    storyHu: 'Egy főút melletti benzinkút-piac felügyelője vagy. Kereslet: P = 400 − 2Q. Kínálat: P = 100 + 2Q. Hol az egyensúly?',
    storyEn: 'You oversee a roadside fuel market. Demand: P = 400 − 2Q. Supply: P = 100 + 2Q. Where is equilibrium?',
    params: { A: 400, Bd: 2, C: 100, Bs: 2 },
    optP: 250,
    optQ: 75,
  },
  {
    id: 'shoes',
    icon: '👟',
    titleHu: 'Cipőpiac — bevásárlóközpont',
    titleEn: 'Shoe Market — Shopping Mall',
    storyHu: 'Egy bevásárlóközpont cipőpiacát elemzed. Kereslet: P = 200 − 2Q. Kínálat: P = 40 + 2Q. Hol egyensúlyozik a piac?',
    storyEn: 'You analyze a shopping mall shoe market. Demand: P = 200 − 2Q. Supply: P = 40 + 2Q. Find the equilibrium.',
    params: { A: 200, Bd: 2, C: 40, Bs: 2 },
    optP: 120,
    optQ: 40,
  },
  {
    id: 'coffee',
    icon: '☕',
    titleHu: 'Kávépiac — egyetemi városban',
    titleEn: 'Coffee Market — University Town',
    storyHu: 'Egy egyetemi város kávépiacán vagy közgazdász elemző. Kereslet: P = 150 − 3Q. Kínálat: P = 30 + 3Q. Mi az egyensúlyi ár és mennyiség?',
    storyEn: 'You are an economist analyzing a university town coffee market. Demand: P = 150 − 3Q. Supply: P = 30 + 3Q. Find equilibrium price and quantity.',
    params: { A: 150, Bd: 3, C: 30, Bs: 3 },
    optP: 90,
    optQ: 20,
  },
  {
    id: 'rent',
    icon: '🏠',
    titleHu: 'Lakásbérleti piac',
    titleEn: 'Rental Housing Market',
    storyHu: 'Egy nagyváros lakásbérleti piacát elemzed. Kereslet: P = 300 − Q. Kínálat: P = 100 + Q. Hol alakul ki az egyensúlyi bérleti díj?',
    storyEn: 'You analyze a city rental housing market. Demand: P = 300 − Q. Supply: P = 100 + Q. Where does equilibrium rent emerge?',
    params: { A: 300, Bd: 1, C: 100, Bs: 1 },
    optP: 200,
    optQ: 100,
  },
]

// ─── LEVEL 2: Curve Shifts ────────────────────────────────────────────────────

export interface SDLevel2Scenario {
  id: string
  icon: string
  titleHu: string
  titleEn: string
  storyHu: string
  storyEn: string
  shiftTypeHu: string
  shiftTypeEn: string
  orig: { A: number; Bd: number; C: number; Bs: number }
  origQ: number
  origP: number
  origCS: number
  origPS: number
  shifted: { A: number; Bd: number; C: number; Bs: number }
  shiftQ: number
  shiftP: number
  shiftCS: number
  shiftPS: number
}

export const SD_LEVEL2_SCENARIOS: SDLevel2Scenario[] = [
  {
    id: 'apple-shift',
    icon: '🍎',
    titleHu: 'Almapiac — kettős sokk',
    titleEn: 'Apple Market — Dual Shock',
    storyHu: 'Az almatermés rekordszintre nőtt (kínálat nő), és egy diétás trend megnövelte az almakereslet is. Mi történt az egyensúllyal?',
    storyEn: 'Apple harvest hit a record high (supply up), and a diet trend boosted demand too. What happened to equilibrium?',
    shiftTypeHu: 'Kereslet ↑ + Kínálat ↑',
    shiftTypeEn: 'Demand ↑ + Supply ↑',
    orig: { A: 100, Bd: 1, C: 20, Bs: 1 },
    origQ: 40, origP: 60, origCS: 800, origPS: 800,
    shifted: { A: 120, Bd: 1, C: 10, Bs: 1 },
    shiftQ: 55, shiftP: 65, shiftCS: 1512, shiftPS: 1512,
  },
  {
    id: 'fuel-shift',
    icon: '⛽',
    titleHu: 'Benzinpiac — olajár-emelkedés',
    titleEn: 'Fuel Market — Oil Price Surge',
    storyHu: 'Az olaj ára emelkedett (kínálati ktg nőtt), a kereslet változatlan. Az egyensúly hogyan változott?',
    storyEn: 'Oil prices rose (supply cost increased), demand unchanged. How did equilibrium change?',
    shiftTypeHu: 'Kínálat ↓ (ktg nőtt)',
    shiftTypeEn: 'Supply ↓ (cost increased)',
    orig: { A: 400, Bd: 2, C: 100, Bs: 2 },
    origQ: 75, origP: 250, origCS: 5625, origPS: 5625,
    shifted: { A: 400, Bd: 2, C: 160, Bs: 2 },
    shiftQ: 60, shiftP: 280, shiftCS: 3600, shiftPS: 3600,
  },
  {
    id: 'coffee-shift',
    icon: '☕',
    titleHu: 'Kávépiac — virális influencer-hatás',
    titleEn: 'Coffee Market — Viral Influencer Effect',
    storyHu: 'Egy divatinfluencer kávévideói virálissá váltak — a kereslet megugrott. Mi változott a kávépiaczon?',
    storyEn: "A fashion influencer's coffee videos went viral — demand spiked. What changed in the coffee market?",
    shiftTypeHu: 'Kereslet ↑ (divathatás)',
    shiftTypeEn: 'Demand ↑ (trend effect)',
    orig: { A: 150, Bd: 3, C: 30, Bs: 3 },
    origQ: 20, origP: 90, origCS: 600, origPS: 600,
    shifted: { A: 180, Bd: 3, C: 30, Bs: 3 },
    shiftQ: 25, shiftP: 105, shiftCS: 938, shiftPS: 938,
  },
  {
    id: 'shoes-shift',
    icon: '👟',
    titleHu: 'Cipőpiac — technológiai innováció',
    titleEn: 'Shoe Market — Technology Innovation',
    storyHu: 'Egy olcsóbb gyártási technológia bevezetésével a cipőgyártás változó ktg csökkent. Hogyan változott a piac?',
    storyEn: 'A cheaper manufacturing technology reduced variable costs in shoe production. How did the market change?',
    shiftTypeHu: 'Kínálat ↑ (tech fejlődés)',
    shiftTypeEn: 'Supply ↑ (tech progress)',
    orig: { A: 200, Bd: 2, C: 40, Bs: 2 },
    origQ: 40, origP: 120, origCS: 1600, origPS: 1600,
    shifted: { A: 200, Bd: 2, C: 20, Bs: 2 },
    shiftQ: 45, shiftP: 110, shiftCS: 2025, shiftPS: 2025,
  },
  {
    id: 'rent-shift',
    icon: '🏠',
    titleHu: 'Lakáspiac — városba költözési hullám',
    titleEn: 'Housing Market — Urban Migration Wave',
    storyHu: 'A városba való beköltözés trendje felerősödött (kereslet nőtt). Hogyan változott a bérleti piac?',
    storyEn: 'A wave of urban migration increased demand. How did the rental market change?',
    shiftTypeHu: 'Kereslet ↑ (városba költözés)',
    shiftTypeEn: 'Demand ↑ (urban migration)',
    orig: { A: 300, Bd: 1, C: 100, Bs: 1 },
    origQ: 100, origP: 200, origCS: 5000, origPS: 5000,
    shifted: { A: 340, Bd: 1, C: 100, Bs: 1 },
    shiftQ: 120, shiftP: 220, shiftCS: 7200, shiftPS: 7200,
  },
]

// ─── LEVEL 3: Price Controls ──────────────────────────────────────────────────

export interface SDLevel3Scenario {
  id: string
  icon: string
  titleHu: string
  titleEn: string
  storyHu: string
  storyEn: string
  params: { A: number; Bd: number; C: number; Bs: number }
  eqP: number
  eqQ: number
  ceilingPrice: number
  floorPrice: number
}

export const SD_LEVEL3_SCENARIOS: SDLevel3Scenario[] = [
  {
    id: 'apple-ctrl',
    icon: '🍎',
    titleHu: 'Almapiac — árszabályozás',
    titleEn: 'Apple Market — Price Controls',
    storyHu: 'Az almapiacot szabályozza a hatóság. Ármaximum: 40 Ft (fogyasztói nyomás), árminimum: 80 Ft (termelő-védelem). Kereslet: P = 100 − Q. Kínálat: P = 20 + Q.',
    storyEn: 'Authorities regulate the apple market. Price ceiling: 40 (consumer pressure), price floor: 80 (producer protection). Demand: P = 100 − Q. Supply: P = 20 + Q.',
    params: { A: 100, Bd: 1, C: 20, Bs: 1 },
    eqP: 60, eqQ: 40,
    ceilingPrice: 40,
    floorPrice: 80,
  },
  {
    id: 'fuel-ctrl',
    icon: '⛽',
    titleHu: 'Benzinpiac — kormányzati árszabályozás',
    titleEn: 'Fuel Market — Government Price Controls',
    storyHu: 'A kormány szabályozza a benzin árát. Ármaximum 200 Ft (fogyasztók védelme), árminimum 300 Ft (kitermelők védelme). Kereslet: P = 400 − 2Q. Kínálat: P = 100 + 2Q.',
    storyEn: 'The government controls fuel prices. Ceiling 200 (consumer protection), floor 300 (producer protection). Demand: P = 400 − 2Q. Supply: P = 100 + 2Q.',
    params: { A: 400, Bd: 2, C: 100, Bs: 2 },
    eqP: 250, eqQ: 75,
    ceilingPrice: 200,
    floorPrice: 300,
  },
  {
    id: 'rent-ctrl',
    icon: '🏠',
    titleHu: 'Lakáspiac — lakbérellenőrzés',
    titleEn: 'Housing Market — Rent Control',
    storyHu: 'A város lakbér-ellenőrzést vezet be. Ármaximum 150 Ft/hó (bérlők védelme), árminimum 250 Ft (bérbeadók védelme). Kereslet: P = 300 − Q. Kínálat: P = 100 + Q.',
    storyEn: 'The city introduces rent control. Ceiling 150 (tenant protection), floor 250 (landlord protection). Demand: P = 300 − Q. Supply: P = 100 + Q.',
    params: { A: 300, Bd: 1, C: 100, Bs: 1 },
    eqP: 200, eqQ: 100,
    ceilingPrice: 150,
    floorPrice: 250,
  },
  {
    id: 'coffee-ctrl',
    icon: '☕',
    titleHu: 'Kávépiac — büfé-árkontroll',
    titleEn: 'Coffee Market — Canteen Price Controls',
    storyHu: 'Az egyetemi büfék kávéjára hatósági árkontroll vonatkozik. Ármaximum 60 Ft, árminimum 120 Ft. Kereslet: P = 150 − 3Q. Kínálat: P = 30 + 3Q.',
    storyEn: 'University canteen coffee is subject to official price controls. Ceiling 60, floor 120. Demand: P = 150 − 3Q. Supply: P = 30 + 3Q.',
    params: { A: 150, Bd: 3, C: 30, Bs: 3 },
    eqP: 90, eqQ: 20,
    ceilingPrice: 60,
    floorPrice: 120,
  },
  {
    id: 'shoes-ctrl',
    icon: '👟',
    titleHu: 'Cipőpiac — munkaruha-árkontroll',
    titleEn: 'Shoe Market — Workwear Price Controls',
    storyHu: 'A munkaruha-piacra árkontrollt vezet be a hatóság. Ármaximum 90 Ft, árminimum 150 Ft (minimálbér-analógia). Kereslet: P = 200 − 2Q. Kínálat: P = 40 + 2Q.',
    storyEn: 'Workwear market subject to price controls. Ceiling 90, floor 150 (minimum wage analogy). Demand: P = 200 − 2Q. Supply: P = 40 + 2Q.',
    params: { A: 200, Bd: 2, C: 40, Bs: 2 },
    eqP: 120, eqQ: 40,
    ceilingPrice: 90,
    floorPrice: 150,
  },
]

// ─── LEVEL 4: Tax & Welfare ───────────────────────────────────────────────────

export interface SDLevel4Scenario {
  id: string
  icon: string
  titleHu: string
  titleEn: string
  storyHu: string
  storyEn: string
  params: { A: number; Bd: number; C: number; Bs: number }
  eqP: number
  eqQ: number
  defaultTax: number
  taxMin: number
  taxMax: number
  shutdownTax: number
  bonusTaxHu: string
  bonusTaxEn: string
}

export const SD_LEVEL4_SCENARIOS: SDLevel4Scenario[] = [
  {
    id: 'apple-tax',
    icon: '🍎',
    titleHu: 'Almapiac — egységadó',
    titleEn: 'Apple Market — Unit Tax',
    storyHu: 'Az állam egységadót vet ki az alma minden kilogrammjára. Te állíthatod be, hogy mennyi legyen az adó. Figyeld, hogyan változnak a jóléti mutatók! Kereslet: P = 100 − Q. Kínálat: P = 20 + Q.',
    storyEn: 'The government imposes a unit tax on every kg of apples. You control the tax rate. Watch how welfare indicators change! Demand: P = 100 − Q. Supply: P = 20 + Q.',
    params: { A: 100, Bd: 1, C: 20, Bs: 1 },
    eqP: 60, eqQ: 40,
    defaultTax: 20,
    taxMin: 0, taxMax: 60,
    shutdownTax: 80,
    bonusTaxHu: 'Ha T=80: P_buyer=100, P_seller=20 → Q=0, piac összeomlik!',
    bonusTaxEn: 'If T=80: P_buyer=100, P_seller=20 → Q=0, market collapses!',
  },
  {
    id: 'fuel-tax',
    icon: '⛽',
    titleHu: 'Benzinpiac — jövedéki adó',
    titleEn: 'Fuel Market — Excise Tax',
    storyHu: 'A kormány jövedéki adót vet ki a benzinre. Figyeld a jóléti hatásokat! Kereslet: P = 400 − 2Q. Kínálat: P = 100 + 2Q.',
    storyEn: 'The government imposes an excise tax on fuel. Watch the welfare effects! Demand: P = 400 − 2Q. Supply: P = 100 + 2Q.',
    params: { A: 400, Bd: 2, C: 100, Bs: 2 },
    eqP: 250, eqQ: 75,
    defaultTax: 50,
    taxMin: 0, taxMax: 200,
    shutdownTax: 300,
    bonusTaxHu: 'Ha T=300: az adóteher kiszorítja a piacot.',
    bonusTaxEn: 'If T=300: the tax burden drives the market to zero.',
  },
  {
    id: 'coffee-tax',
    icon: '☕',
    titleHu: 'Kávépiac — forgalmi adó',
    titleEn: 'Coffee Market — Sales Tax',
    storyHu: 'Forgalmi adót vetnek ki a kávéra. Kinek van nagyobb terhe — a vevőnek vagy az eladónak? Kereslet: P = 150 − 3Q. Kínálat: P = 30 + 3Q.',
    storyEn: 'A sales tax is levied on coffee. Who bears more burden — buyer or seller? Demand: P = 150 − 3Q. Supply: P = 30 + 3Q.',
    params: { A: 150, Bd: 3, C: 30, Bs: 3 },
    eqP: 90, eqQ: 20,
    defaultTax: 30,
    taxMin: 0, taxMax: 100,
    shutdownTax: 120,
    bonusTaxHu: 'Ha T=120: a kávépiac leáll.',
    bonusTaxEn: 'If T=120: the coffee market shuts down.',
  },
  {
    id: 'shoes-tax',
    icon: '👟',
    titleHu: 'Cipőpiac — import vám',
    titleEn: 'Shoe Market — Import Tariff',
    storyHu: 'Import vámot vetnek ki a cipőkre. Hogyan változik a fogyasztói és termelői többlet? Kereslet: P = 200 − 2Q. Kínálat: P = 40 + 2Q.',
    storyEn: 'An import tariff is placed on shoes. How do consumer and producer surplus change? Demand: P = 200 − 2Q. Supply: P = 40 + 2Q.',
    params: { A: 200, Bd: 2, C: 40, Bs: 2 },
    eqP: 120, eqQ: 40,
    defaultTax: 40,
    taxMin: 0, taxMax: 120,
    shutdownTax: 160,
    bonusTaxHu: 'Ha T=160: cipőpiac összeomlik.',
    bonusTaxEn: 'If T=160: shoe market collapses.',
  },
  {
    id: 'rent-tax',
    icon: '🏠',
    titleHu: 'Lakáspiac — ingatlanadó',
    titleEn: 'Housing Market — Property Tax',
    storyHu: 'Ingatlanadót vetnek ki a bérleti tranzakciókra. Hogyan hat ez a bérleti díjra és a piac méretére? Kereslet: P = 300 − Q. Kínálat: P = 100 + Q.',
    storyEn: 'A property tax is applied to rental transactions. How does this affect rent and market size? Demand: P = 300 − Q. Supply: P = 100 + Q.',
    params: { A: 300, Bd: 1, C: 100, Bs: 1 },
    eqP: 200, eqQ: 100,
    defaultTax: 40,
    taxMin: 0, taxMax: 150,
    shutdownTax: 200,
    bonusTaxHu: 'Ha T=200: bérleti piac összeomlik.',
    bonusTaxEn: 'If T=200: rental market collapses.',
  },
]
