export interface GameLevel {
  id: number
  titleHu: string
  titleEn: string
  descHu: string
  descEn: string
}

export interface Game {
  slug: string
  titleHu: string
  titleEn: string
  descHu: string
  descEn: string
  icon: string
  image?: string
  scoreOffset: number   // score DB level = scoreOffset + level.id
  levels: GameLevel[]
  available: boolean
}

export const GAMES: Game[] = [
  {
    slug: 'monopoly',
    scoreOffset: 0,
    titleHu: 'Monopólium',
    titleEn: 'Monopoly',
    icon: '🏭',
    image: '/monopolium.webp',
    descHu: 'Fedezd fel, hogyan határoz árat egy monopólista — és mit veszít emiatt a társadalom.',
    descEn: 'Discover how a monopolist sets prices — and what society loses because of it.',
    available: true,
    levels: [
      {
        id: 1,
        titleHu: 'Árdöntés',
        titleEn: 'Price Setting',
        descHu: 'Melyik áron a legnagyobb a profit?',
        descEn: 'Which price maximizes profit?',
      },
      {
        id: 2,
        titleHu: 'Árdiszkrimináció',
        titleEn: 'Price Discrimination',
        descHu: 'Mi van, ha különböző árat szabsz különböző vevőknek?',
        descEn: 'What if you charge different prices to different buyers?',
      },
      {
        id: 3,
        titleHu: 'Verseny vs. Monopólium',
        titleEn: 'Competition vs. Monopoly',
        descHu: 'Hogyan különbözik a versenypiaci egyensúlytól?',
        descEn: 'How does it differ from competitive equilibrium?',
      },
      {
        id: 4,
        titleHu: 'Szabályozás',
        titleEn: 'Regulation',
        descHu: 'Mi történik, ha árplafont szabnak?',
        descEn: 'What happens when a price cap is imposed?',
      },
    ],
  },
  {
    slug: 'supply-demand',
    scoreOffset: 4,
    titleHu: 'Kereslet-kínálat',
    titleEn: 'Supply & Demand',
    icon: '⚖️',
    image: '/kereslet-kinalat.webp',
    descHu: 'Fedezd fel az egyensúlyt, az eltolódásokat és a piaci beavatkozások hatásait.',
    descEn: 'Explore equilibrium, shifts, and the effects of market interventions.',
    available: true,
    levels: [
      {
        id: 1,
        titleHu: 'Piaci egyensúly',
        titleEn: 'Market Equilibrium',
        descHu: 'Hol találkozik a kereslet és a kínálat?',
        descEn: 'Where do supply and demand meet?',
      },
      {
        id: 2,
        titleHu: 'Eltolódások',
        titleEn: 'Shifts',
        descHu: 'Mi történik, ha a görbe elmozdul?',
        descEn: 'What happens when a curve shifts?',
      },
      {
        id: 3,
        titleHu: 'Beavatkozások',
        titleEn: 'Interventions',
        descHu: 'Árplafon és árpadló hatásai',
        descEn: 'Effects of price ceilings and floors',
      },
      {
        id: 4,
        titleHu: 'Jóléti hatások',
        titleEn: 'Welfare Effects',
        descHu: 'Ki viseli az adó terhét?',
        descEn: 'Who bears the tax burden?',
      },
    ],
  },
  {
    slug: 'budget-constraint',
    scoreOffset: 12,
    titleHu: 'Fogyasztáselmélet',
    titleEn: 'Consumer Theory',
    icon: '🛒',
    image: '/fogyasztaselmelet.webp',
    descHu: 'Fedezd fel a költségvetési egyenest, a közömbösségi görbéket és a fogyasztói optimumot — majd nézd meg, mi történik az ár- és jövedelemváltozásokkor.',
    descEn: 'Explore the budget constraint, indifference curves, and consumer optimum — then see what happens when prices and income change.',
    available: true,
    levels: [
      {
        id: 1,
        titleHu: 'Költségvetési egyenes',
        titleEn: 'Budget Constraint',
        descHu: 'Mit vehetsz meg a jövedelmedből? Opportunity cost és meredekség.',
        descEn: 'What can you buy with your income? Opportunity cost and slope.',
      },
      {
        id: 2,
        titleHu: 'Közömbösségi görbék',
        titleEn: 'Indifference Curves',
        descHu: 'Melyik kosár jobb? A csökkenő MRS és az IC térkép.',
        descEn: 'Which basket is better? Diminishing MRS and the IC map.',
      },
      {
        id: 3,
        titleHu: 'Fogyasztói optimum',
        titleEn: 'Consumer Optimum',
        descHu: 'Találd meg az érintési pontot: MRS = Px/Py.',
        descEn: 'Find the tangency point: MRS = Px/Py.',
      },
      {
        id: 4,
        titleHu: 'Ár- és jövedelemhatás',
        titleEn: 'Price & Income Effects',
        descHu: 'Slutsky-felbontás: helyettesítési és jövedelemhatás.',
        descEn: 'Slutsky decomposition: substitution and income effects.',
      },
    ],
  },
  {
    slug: 'costs',
    scoreOffset: 8,
    titleHu: 'Vállalati költségek',
    titleEn: 'Firm Costs',
    icon: '🏭',
    image: '/vallalatikoltsegek.webp',
    descHu: 'Fedezd fel a fix és változó ktg különbségét, a határköltséget és a profitmaximalizálást.',
    descEn: 'Explore the difference between fixed and variable costs, marginal cost, and profit maximization.',
    available: true,
    levels: [
      {
        id: 1,
        titleHu: 'Fix vs. Változó',
        titleEn: 'Fixed vs. Variable',
        descHu: 'Melyik költség marad, ha nem termel a pékség?',
        descEn: 'Which cost remains even when the bakery produces nothing?',
      },
      {
        id: 2,
        titleHu: 'Határköltség',
        titleEn: 'Marginal Cost',
        descHu: 'Mennyibe kerül az egyik extra kosár?',
        descEn: 'What does one extra basket cost?',
      },
      {
        id: 3,
        titleHu: 'Átlagköltségek',
        titleEn: 'Average Costs',
        descHu: 'Hol a leghatékonyabb a pékség?',
        descEn: 'Where is the bakery most efficient?',
      },
      {
        id: 4,
        titleHu: 'Profitmaximalizálás',
        titleEn: 'Profit Maximization',
        descHu: 'Hány kosarat süssz P=60 Ft áron?',
        descEn: 'How many baskets do you bake at P=60 Ft?',
      },
    ],
  },
  {
    slug: 'elasticity',
    scoreOffset: 20,
    titleHu: 'Rugalmasság',
    titleEn: 'Elasticity',
    icon: '📐',
    image: '/rugalmassag.webp',
    descHu: 'Fedezd fel, hogyan reagálnak a piacok az ár- és jövedelemváltozásokra.',
    descEn: 'Discover how markets respond to price and income changes.',
    available: true,
    levels: [
      { id: 1, titleHu: 'Kereslet árrugalmassága (PED)', titleEn: 'Price Elasticity of Demand (PED)', descHu: 'Rugalmas vagy rugalmatlan? Jóslás és mérés.', descEn: 'Elastic or inelastic? Predict and measure.' },
      { id: 2, titleHu: 'Kínálat rugalmassága (PES)', titleEn: 'Price Elasticity of Supply (PES)', descHu: 'Rövid vs. hosszú táv alkalmazkodás.', descEn: 'Short vs. long run adjustment.' },
      { id: 3, titleHu: 'Kereszt-árrugalmasság (XED)', titleEn: 'Cross-Price Elasticity (XED)', descHu: 'Helyettesítők és komplementerek.', descEn: 'Substitutes and complements.' },
      { id: 4, titleHu: 'Jövedelemrugalmasság (YED)', titleEn: 'Income Elasticity (YED)', descHu: 'Normál, inferior vagy luxuscikk?', descEn: 'Normal, inferior, or luxury good?' },
    ],
  },
  // Jövőbeli játékok ide kerülnek:
  // { slug: 'oligopoly', titleHu: 'Oligopólium', ... available: false }
]

export function getGame(slug: string): Game | undefined {
  return GAMES.find(g => g.slug === slug)
}
