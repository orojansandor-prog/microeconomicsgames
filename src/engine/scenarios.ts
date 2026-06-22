/**
 * Szcenáriók — minden szinthez 3–5 különböző feladatkontextus.
 * Az engine SOHA nem számol: minden szám a determinisztikus monopoly.ts-ből jön.
 * Claude csak magyaráz/mesél — soha nem számol kifizetést.
 */

export interface Buyer {
  name: string
  wtp: number
  emoji: string
  roleHu: string
  roleEn: string
}

export interface Level1Scenario {
  id: string
  icon: string
  titleHu: string; titleEn: string
  storyHu: string; storyEn: string
  industryHu: string; industryEn: string  // rövid iparág-leírás
  params: { A: number; B: number; MC: number }
  buyers: Buyer[]
  sliderMin: number; sliderMax: number; sliderStep: number
  realExampleHu: string; realExampleEn: string
}

export interface Level2Scenario {
  id: string
  icon: string
  titleHu: string; titleEn: string
  storyHu: string; storyEn: string
  m1: { labelHu: string; labelEn: string; icon: string; A: number; B: number; MC: number }
  m2: { labelHu: string; labelEn: string; icon: string; A: number; B: number; MC: number }
}

export interface Level3Scenario {
  id: string
  icon: string
  titleHu: string; titleEn: string
  storyHu: string; storyEn: string
  params: { A: number; B: number; MC: number }
}

export interface Level4Scenario {
  id: string
  icon: string
  titleHu: string; titleEn: string
  storyHu: string; storyEn: string
  params: { A: number; B: number; MC: number }
  regulatorHu: string; regulatorEn: string
}

// ─── LEVEL 1 — 5 szcenárió ────────────────────────────────────
// Minden esetben: Q* = (A−MC)/(2B), P* = (A+MC)/2 — egész számok
// Vevők WTP: a felső 3 vásárol az optimális P*-nél, ez a diszkrét optimum

export const LEVEL1_SCENARIOS: Level1Scenario[] = [
  {
    id: 'pharmacy',
    icon: '💊',
    titleHu: 'Sziget gyógyszertár',
    titleEn: 'Island Pharmacy',
    storyHu: 'Egy apró sziget egyetlen gyógyszertárát vezeted. Minden doboz előállítása és szállítása 20 Ft-ba kerül (MC = 20). Nincs versenytársad — te szabod az árat. Ha túl magasra emeled, vevőid kimaradnak; ha túl alacsonyra viszed, elajándékozod a profitot.',
    storyEn: 'You run the only pharmacy on a small island. Each box costs 20 to produce and deliver (MC = 20). No competition — you set the price. Too high and buyers drop out; too low and you give away profit.',
    industryHu: 'Egészségügy · Monopólium',
    industryEn: 'Healthcare · Monopoly',
    params: { A: 100, B: 2, MC: 20 },
    buyers: [
      { name: 'Kata',  wtp: 90, emoji: '👩‍💼', roleHu: 'Igazgató',  roleEn: 'Manager'  },
      { name: 'Péter', wtp: 70, emoji: '🧑‍🎓', roleHu: 'Diák',      roleEn: 'Student'  },
      { name: 'Mari',  wtp: 60, emoji: '👩‍🍳', roleHu: 'Szakács',   roleEn: 'Chef'     },
      { name: 'Bence', wtp: 40, emoji: '🧑‍🔧', roleHu: 'Szerelő',   roleEn: 'Mechanic' },
      { name: 'Lilla', wtp: 20, emoji: '👩‍🎨', roleHu: 'Művész',    roleEn: 'Artist'   },
    ],
    sliderMin: 10, sliderMax: 100, sliderStep: 5,
    realExampleHu: 'Az EpiPen (anafil. sokk elleni szer) ára az USA-ban 100$-ról 600$-ra ugrott 2007–2016 közt. A gyártó monopolhelyzetét kihasználva árazott, miközben a gyártási költség 10$ alatt maradt.',
    realExampleEn: 'The EpiPen price in the US jumped from $100 to $600 between 2007–2016. The manufacturer exploited its monopoly position while production cost stayed under $10.',
  },
  {
    id: 'cinema',
    icon: '🎬',
    titleHu: 'Városmozi',
    titleEn: 'Town Cinema',
    storyHu: 'Kisvárosod egyetlen mozijának főnöke vagy. Minden vetítés egy extra nézőnek 20 Ft-ba kerül (MC = 20, pl. jegy nyomtatás + takarítás). Máshol nincs mozi — szabadon árazhatsz. Ha sokat kérsz, üres lesz a terem; ha keveset, nem éri meg.',
    storyEn: 'You run the only cinema in a small town. Each additional viewer costs 20 (MC = 20 — ticket printing + cleaning). No other cinema — price freely. Too high and the hall empties; too low and it is not worth it.',
    industryHu: 'Szórakoztatóipar · Monopólium',
    industryEn: 'Entertainment · Monopoly',
    params: { A: 80, B: 2, MC: 20 },
    buyers: [
      { name: 'Réka',  wtp: 70, emoji: '👩‍🏫', roleHu: 'Tanárnő',  roleEn: 'Teacher'  },
      { name: 'Ádám',  wtp: 60, emoji: '🧑‍💻', roleHu: 'Fejlesztő', roleEn: 'Developer'},
      { name: 'Nóra',  wtp: 50, emoji: '👩‍⚕️', roleHu: 'Orvos',    roleEn: 'Doctor'   },
      { name: 'Csabi', wtp: 35, emoji: '🧑‍🚒', roleHu: 'Tűzoltó',  roleEn: 'Fireman'  },
      { name: 'Erika', wtp: 20, emoji: '👩‍🌾', roleHu: 'Gazdálkodó','roleEn': 'Farmer' },
    ],
    sliderMin: 10, sliderMax: 80, sliderStep: 5,
    realExampleHu: 'A Regal Cinemas csődöt jelentett 2020-ban, miután az OTT platformok (Netflix, Disney+) drámaian csökkentették a fizetési hajlandóságot. A mozis monopólium felbomlott a digitális verseny előtt.',
    realExampleEn: "Regal Cinemas filed for bankruptcy in 2020 as OTT platforms (Netflix, Disney+) slashed consumers' willingness to pay. The cinema monopoly crumbled before digital competition.",
  },
  {
    id: 'railway',
    icon: '🚂',
    titleHu: 'Vasúttársaság',
    titleEn: 'Railway Company',
    storyHu: 'Te vagy az ország egyetlen vasúttársaságának főnöke egy fontos útvonalon. Minden egyes utas szállítási és karbantartási költsége 30 Ft (MC = 30). Versenyző nincs — te állítsz be árat. Ha magasan tartod, az üzleti utasok is otthon maradnak.',
    storyEn: "You are the CEO of the country's only railway on a key route. Each passenger costs 30 to transport and maintain (MC = 30). No competitors — you set the fare. Price too high and even business travellers stay home.",
    industryHu: 'Közlekedés · Természetes monopólium',
    industryEn: 'Transport · Natural monopoly',
    params: { A: 120, B: 3, MC: 30 },
    buyers: [
      { name: 'Dóra',   wtp: 105, emoji: '👩‍💼', roleHu: 'Vezérigazgató', roleEn: 'CEO'       },
      { name: 'Attila', wtp:  90, emoji: '🧑‍⚖️', roleHu: 'Ügyvéd',        roleEn: 'Lawyer'    },
      { name: 'Klára',  wtp:  75, emoji: '👩‍🔬', roleHu: 'Kutató',        roleEn: 'Researcher'},
      { name: 'Gergő',  wtp:  55, emoji: '🧑‍🎓', roleHu: 'Diák',          roleEn: 'Student'   },
      { name: 'Petra',  wtp:  35, emoji: '👩‍🌾', roleHu: 'Gazdálkodó',    roleEn: 'Farmer'    },
    ],
    sliderMin: 30, sliderMax: 120, sliderStep: 5,
    realExampleHu: 'A MÁV ártámogatás nélkül veszteséges lenne az ingázó vonalakon — pont mert a monopólium árát az állam korlátozzák, hogy a DWL (el nem ért utazások veszteége) ne nőjön tovább.',
    realExampleEn: 'MÁV (Hungarian Rail) would be loss-making on commuter lines without subsidies — because the government caps the monopoly price to limit DWL (welfare lost from unrealised trips).',
  },
  {
    id: 'water',
    icon: '💧',
    titleHu: 'Vízszolgáltató',
    titleEn: 'Water Utility',
    storyHu: 'Egy ipari övezet egyetlen vízszolgáltatója vagy. A hálózat karbantartása miatt minden köbméter víznek 20 Ft a határköltsége (MC = 20). A cégek rugalmatlanabbul reagálnak az árra, mint a háztartások — de ha túl sokat kérsz, más megoldásokat keresnek.',
    storyEn: 'You are the sole water provider for an industrial zone. Network maintenance means each cubic metre has a marginal cost of 20 (MC = 20). Firms are relatively price-inelastic — but price too high and they seek alternatives.',
    industryHu: 'Közmű · Természetes monopólium',
    industryEn: 'Utility · Natural monopoly',
    params: { A: 100, B: 4, MC: 20 },
    buyers: [
      { name: 'Zoli', wtp: 90, emoji: '🏭', roleHu: 'Gyár',       roleEn: 'Factory'   },
      { name: 'Anna', wtp: 75, emoji: '🏗️', roleHu: 'Építőcég',   roleEn: 'Builder'   },
      { name: 'Tamás',wtp: 60, emoji: '🏪', roleHu: 'Étterem',    roleEn: 'Restaurant'},
      { name: 'Jutka',wtp: 45, emoji: '🛒', roleHu: 'Szupermarket','roleEn':'Supermarket'},
      { name: 'Béla', wtp: 30, emoji: '🌿', roleHu: 'Kertészet',  roleEn: 'Nursery'   },
    ],
    sliderMin: 10, sliderMax: 100, sliderStep: 5,
    realExampleHu: 'A Thames Water (London) 2024-ben 40%-os díjemelési kérelmet nyújtott be az Ofwat szabályozóhoz. Monopóliumként nincs versenynyomás — az ár csak szabályozással korlátozható.',
    realExampleEn: 'Thames Water (London) filed a 40% tariff increase request with regulator Ofwat in 2024. As a monopoly there is no competitive pressure — price can only be limited through regulation.',
  },
  {
    id: 'gamedev',
    icon: '🎮',
    titleHu: 'Játékkiadó',
    titleEn: 'Game Publisher',
    storyHu: 'A játékod egyetlen platformon jelenik meg exkluzív szerződéssel. A fejlesztés és szerver-üzemeltetés miatt minden eladott licenc határköltsége 40 Ft (MC = 40 — magasabb, mert exkluzív infrastruktúrát tart fenn). Nincs konkurens cím — az egyetlen választás vagy.',
    storyEn: 'Your game launches exclusively on one platform. Development and server costs mean each sold licence costs 40 (MC = 40 — higher due to exclusive infrastructure). No rival title — you are the only choice.',
    industryHu: 'Digitális média · Platformmonopólium',
    industryEn: 'Digital media · Platform monopoly',
    params: { A: 100, B: 2, MC: 40 },
    buyers: [
      { name: 'Máté',    wtp: 90, emoji: '🎯', roleHu: 'Hardcore gamer', roleEn: 'Hardcore gamer'},
      { name: 'Zsófi',   wtp: 80, emoji: '🕹️', roleHu: 'Streamer',       roleEn: 'Streamer'      },
      { name: 'Norbert', wtp: 70, emoji: '👾', roleHu: 'Alkalmi játékos', roleEn: 'Casual gamer'  },
      { name: 'Vivien',  wtp: 55, emoji: '📱', roleHu: 'Mobilos',         roleEn: 'Mobile gamer'  },
      { name: 'Kristóf', wtp: 45, emoji: '📚', roleHu: 'Tanuló',          roleEn: 'Student'       },
    ],
    sliderMin: 40, sliderMax: 100, sliderStep: 5,
    realExampleHu: 'Az Apple App Store monopolhelyzete: az Epic Games 2020-ban perelte az Apple-t, mert a 30%-os jutalék (ami az MC felett tartja az árakat) 1 milliárd dolláros DWL-t okozhat a fejlesztői ökoszisztémában.',
    realExampleEn: 'Apple App Store monopoly: Epic Games sued Apple in 2020 because the 30% commission (which keeps prices above competitive MC) may cause over $1 billion in deadweight loss across the developer ecosystem.',
  },
]

// ─── LEVEL 2 — 5 szcenárió ────────────────────────────────────

export const LEVEL2_SCENARIOS: Level2Scenario[] = [
  {
    id: 'hospital-sw',
    icon: '🏥',
    titleHu: 'Kórházi szoftver',
    titleEn: 'Hospital Software',
    storyHu: 'Kórházi szoftvert adsz el. Két ügyfélcsoportod van: prémium magánkórházak (gazdagabb kereslet) és állami kórházak (szűkösebb büdzsé). Különböző árat szabhatsz nekik — ez az árdiszkrimináció. MC = 20/licenc.',
    storyEn: 'You sell hospital software. Two customer groups: premium private hospitals (richer demand) and public hospitals (tighter budget). You can charge different prices — this is price discrimination. MC = 20/licence.',
    m1: { labelHu: 'Magánkórházak', labelEn: 'Private hospitals', icon: '🏥', A: 120, B: 3, MC: 20 },
    m2: { labelHu: 'Állami kórházak', labelEn: 'Public hospitals', icon: '🏨', A: 80, B: 2, MC: 20 },
  },
  {
    id: 'airline',
    icon: '✈️',
    titleHu: 'Repülőjegy',
    titleEn: 'Airline tickets',
    storyHu: 'Légitársaságod egyetlen útvonalon repül. Két ügyfélköröd van: üzleti utasok (rugalmatlan kereslet — a cégük fizet) és turisták (árérzékeny kereslet). Eltérő osztályok különböző árral — MC = 30/jegy.',
    storyEn: 'Your airline operates a single route. Two client groups: business travellers (inelastic — company pays) and tourists (price-sensitive). Different classes, different prices — MC = 30/ticket.',
    m1: { labelHu: 'Business osztály', labelEn: 'Business class', icon: '💼', A: 150, B: 3, MC: 30 },
    m2: { labelHu: 'Turista osztály',  labelEn: 'Economy class',  icon: '🏖️', A: 90,  B: 3, MC: 30 },
  },
  {
    id: 'textbook',
    icon: '📚',
    titleHu: 'Tankönyvkiadó',
    titleEn: 'Textbook publisher',
    storyHu: 'Egyedi tankönyvet adsz ki, amelyet más nem forgalmaz. Két piacod van: jómódú nyugati egyetemek (magas fizetési hajlandóság) és közép-kelet-európai intézmények (szűkösebb büdzsé). MC = 20/könyv.',
    storyEn: 'You publish a unique textbook that nobody else carries. Two markets: affluent Western universities (high willingness to pay) and Central-Eastern European institutions (tighter budget). MC = 20/book.',
    m1: { labelHu: 'Nyugati egyetemek', labelEn: 'Western universities', icon: '🎓', A: 100, B: 2, MC: 20 },
    m2: { labelHu: 'KKE intézmények',   labelEn: 'CEE institutions',      icon: '🏫', A: 60,  B: 2, MC: 20 },
  },
  {
    id: 'streaming',
    icon: '🎵',
    titleHu: 'Streaming platform',
    titleEn: 'Streaming platform',
    storyHu: 'Zenei streaming platformot üzemeltetsz. Két ügyfélcsoportod van: prémium előfizetők (magas WTP, pl. zenészek, audiofilek) és alkalmi hallgatók (alacsonyabb WTP). Két különböző csomaggal diszkriminálhatsz. MC = 10/hó/felhasználó.',
    storyEn: 'You run a music streaming platform. Two customer groups: premium subscribers (high WTP — musicians, audiophiles) and casual listeners (lower WTP). You can discriminate with two plans. MC = 10/month/user.',
    m1: { labelHu: 'Prémium csomag', labelEn: 'Premium plan', icon: '🎧', A: 100, B: 2, MC: 10 },
    m2: { labelHu: 'Alap csomag', labelEn: 'Basic plan', icon: '📻', A: 60, B: 2, MC: 10 },
  },
  {
    id: 'themepark',
    icon: '🎢',
    titleHu: 'Vidámpark',
    titleEn: 'Theme park',
    storyHu: 'Egyetlen vidámpark a városban — te diktálod az árat. Két piacod van: felnőttek (magasabb WTP — ők fizetnek saját maguknak) és diákok/csoportok (alacsonyabb WTP, de sokan vannak). MC = 15/jegy (üzemeltetés/fő).',
    storyEn: 'The only theme park in town — you set the price. Two markets: adults (higher WTP — paying for themselves) and students/groups (lower WTP but large numbers). MC = 15/ticket (operations per person).',
    m1: { labelHu: 'Felnőtt jegy', labelEn: 'Adult ticket', icon: '🧑', A: 120, B: 3, MC: 15 },
    m2: { labelHu: 'Diák/csoport', labelEn: 'Student/group', icon: '🎒', A: 75, B: 3, MC: 15 },
  },
]

// ─── LEVEL 3 — 5 szcenárió ────────────────────────────────────

export const LEVEL3_SCENARIOS: Level3Scenario[] = [
  {
    id: 'pharma',
    icon: '💊',
    titleHu: 'Gyógyszeripari piac',
    titleEn: 'Pharmaceutical market',
    storyHu: 'Ugyanaz a kereslet (P = 100 − 2Q) és MC = 20. Két szcenárió: versenypiaci szabadpiac vs. szabadalommal védett monopólium. Melyik kedvezőbb a fogyasztóknak? Melyik a hatékonyabb társadalmilag?',
    storyEn: 'Same demand (P = 100 − 2Q) and MC = 20. Two scenarios: competitive free market vs. patent-protected monopoly. Which is better for consumers? Which is socially efficient?',
    params: { A: 100, B: 2, MC: 20 },
  },
  {
    id: 'railway-l3',
    icon: '🚂',
    titleHu: 'Közlekedési piac',
    titleEn: 'Transport market',
    storyHu: 'Kereslet: P = 120 − 3Q, MC = 30. Hasonlítsd össze: ha egy vasúttársaság monopolista, vagy ha versenyeznek egymással a fuvarozók. Melyik esetben több az utas? Hol kisebb a holtteher?',
    storyEn: 'Demand: P = 120 − 3Q, MC = 30. Compare: a single monopolist railway vs. competing carriers. In which case are there more passengers? Where is deadweight loss smaller?',
    params: { A: 120, B: 3, MC: 30 },
  },
  {
    id: 'streaming-l3',
    icon: '🎵',
    titleHu: 'Streaming platform',
    titleEn: 'Streaming platform',
    storyHu: 'Kereslet: P = 80 − 2Q, MC = 20. Egyetlen streaming gigász vs. versengő platformok (Spotify, Apple, Amazon stb.). Melyik esetben fizetsz kevesebbet előfizetőként? Melyik esetben több a tartalom?',
    storyEn: 'Demand: P = 80 − 2Q, MC = 20. Single streaming giant vs. competing platforms (Spotify, Apple, Amazon, etc.). As a subscriber, when do you pay less? When is there more content?',
    params: { A: 80, B: 2, MC: 20 },
  },
  {
    id: 'ev-l3',
    icon: '🚗',
    titleHu: 'Elektromos autók',
    titleEn: 'Electric vehicles',
    storyHu: 'Kereslet: P = 90 − 3Q, MC = 30. Képzeld el: egyetlen dominálisan pozícionált EV-gyártó (monopólium) vs. sok versengő gyártó (verseny). Melyik esetben olcsóbb az autó? Melyik esetben fogy több? Hol lesz kisebb a DWL?',
    storyEn: 'Demand: P = 90 − 3Q, MC = 30. Imagine: one dominant EV maker (monopoly) vs. many competing manufacturers (competition). When is the car cheaper? When do more cars sell? Where is DWL smaller?',
    params: { A: 90, B: 3, MC: 30 },
  },
  {
    id: 'internet-l3',
    icon: '🌐',
    titleHu: 'Szélessávú internet',
    titleEn: 'Broadband internet',
    storyHu: 'Kereslet: P = 140 − 4Q, MC = 40. Hasonlítsd össze: kábeles egyeduralkodó internetszolgáltató vs. versengő lefedettség (pl. több cég egyazon területen). Melyik esetben több a csatlakozás? Hol kisebb a holtteher?',
    storyEn: 'Demand: P = 140 − 4Q, MC = 40. Compare: a cable monopoly ISP vs. competing coverage (multiple providers in the same area). When are there more connections? Where is deadweight loss smaller?',
    params: { A: 140, B: 4, MC: 40 },
  },
]

// ─── LEVEL 4 — 5 szcenárió ────────────────────────────────────

export const LEVEL4_SCENARIOS: Level4Scenario[] = [
  {
    id: 'energy',
    icon: '⚡',
    titleHu: 'Energiaszolgáltató',
    titleEn: 'Energy provider',
    storyHu: 'A szabályozó hatóság árplafont vezet be az energiaszolgáltatóra (P = 100 − 2Q, MC = 20). Húzd a csúszkát: hol legyen a plafon? Figyeld, hogyan változik a DWL, a CS és a profit.',
    storyEn: 'The regulator introduces a price cap on the energy provider (P = 100 − 2Q, MC = 20). Drag the slider: where should the cap be? Watch how DWL, CS, and profit change.',
    params: { A: 100, B: 2, MC: 20 },
    regulatorHu: 'Energiaszabályozó Hivatal',
    regulatorEn: 'Energy Regulatory Authority',
  },
  {
    id: 'railway-l4',
    icon: '🚂',
    titleHu: 'Vasúti tarifareguláció',
    titleEn: 'Railway tariff regulation',
    storyHu: 'A közlekedési hatóság tarifa-plafont szab a vasúttársaságra (P = 120 − 3Q, MC = 30). Te a hatóság tanácsadója vagy: melyik plafon minimalizálja a holtteher-veszteséget, miközben a vállalat még profitábilis marad?',
    storyEn: "The transport authority sets a tariff cap for the railway (P = 120 − 3Q, MC = 30). You are the authority's advisor: which cap minimises deadweight loss while keeping the firm profitable?",
    params: { A: 120, B: 3, MC: 30 },
    regulatorHu: 'Közlekedési Hatóság',
    regulatorEn: 'Transport Authority',
  },
  {
    id: 'telecom-l4',
    icon: '📡',
    titleHu: 'Telekommunkikáció',
    titleEn: 'Telecommunications',
    storyHu: 'A média-hatóság díjplafont szabályoz egy dominálisan pozícionált telekommunikációs cégre (P = 80 − 2Q, MC = 20). Hol van az egyensúly a fogyasztóvédelem és a beruházási ösztönzők között?',
    storyEn: 'The media authority caps fees on a dominant telecom (P = 80 − 2Q, MC = 20). Where is the balance between consumer protection and investment incentives?',
    params: { A: 80, B: 2, MC: 20 },
    regulatorHu: 'Médiahatóság',
    regulatorEn: 'Media Authority',
  },
  {
    id: 'water-l4',
    icon: '💧',
    titleHu: 'Vízmű szabályozás',
    titleEn: 'Water utility regulation',
    storyHu: 'A vízszolgáltatóra (P = 90 − 3Q, MC = 30) a közüzemi hatóság árplafont szab. Te a hatóság közgazdász-tanácsadója vagy: melyik plafon minimalizálja a holtteher-veszteséget, miközben a vízszolgáltató még fedezi a ktg-eit?',
    storyEn: 'The water utility (P = 90 − 3Q, MC = 30) faces a price cap from the regulator. You are the economist-advisor: which cap minimises DWL while the utility still covers its costs?',
    params: { A: 90, B: 3, MC: 30 },
    regulatorHu: 'Közüzemi Hatóság',
    regulatorEn: 'Utilities Regulator',
  },
  {
    id: 'broadband-l4',
    icon: '🌐',
    titleHu: 'Internet-szabályozás',
    titleEn: 'Internet regulation',
    storyHu: 'Egy domináns internetszolgáltató (P = 140 − 4Q, MC = 40) piacon a szabályozó árplafonnal beavatkozhat. Húzd a csúszkát: melyik áron csökken legjobban a DWL? Figyeld, hogy mi történik a CS-sel és a vállalat profitjával.',
    storyEn: "A dominant ISP (P = 140 − 4Q, MC = 40) can be regulated with a price cap. Drag the slider: at which price does DWL decrease the most? Watch what happens to CS and the firm's profit.",
    params: { A: 140, B: 4, MC: 40 },
    regulatorHu: 'Médiaszabályozó Hatóság',
    regulatorEn: 'Media Regulatory Authority',
  },
]

// ─── Segédfüggvény ─────────────────────────────────────────────

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
