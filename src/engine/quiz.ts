export interface QuizQuestion {
  id: string
  hu: string
  en: string
  options: {
    hu: string
    en: string
  }[]
  correctIndex: number
}

export const LEVEL1_QUIZ: QuizQuestion[] = [
  {
    id: 'l1q1',
    hu: 'Mikor maximalizálja profitját az egyárú monopolista?',
    en: 'When does a single-price monopolist maximise profit?',
    options: [
      { hu: 'Amikor MR = MC', en: 'When MR = MC' },
      { hu: 'Amikor TR maximális', en: 'When TR is maximised' },
      { hu: 'Amikor P = MC', en: 'When P = MC' },
    ],
    correctIndex: 0,
  },
  {
    id: 'l1q2',
    hu: 'Hogyan viszonyul a monopolista ára a határköltségéhez?',
    en: "How does the monopolist's price compare to marginal cost?",
    options: [
      { hu: 'P = MC', en: 'P = MC' },
      { hu: 'P < MC', en: 'P < MC' },
      { hu: 'P > MC', en: 'P > MC' },
    ],
    correctIndex: 2,
  },
  {
    id: 'l1q3',
    hu: 'Mi a holtteher-veszteség (DWL) monopoliumnál?',
    en: 'What is deadweight loss (DWL) under monopoly?',
    options: [
      { hu: 'A monopolista profitjának csökkenése', en: "The monopolist's profit loss" },
      { hu: 'A meg nem valósuló hatékony cserék társadalmi vesztesége', en: "Social loss from efficient trades that don't occur" },
      { hu: 'A fogyasztók teljes vesztesége', en: "Consumers' total loss" },
    ],
    correctIndex: 1,
  },
  {
    id: 'l1q4',
    hu: 'Ha P = 100 − Q és MC = 20, mi az optimális monopolista ár?',
    en: 'If P = 100 − Q and MC = 20, what is the optimal monopoly price?',
    options: [
      { hu: 'P = 20', en: 'P = 20' },
      { hu: 'P = 40', en: 'P = 40' },
      { hu: 'P = 60', en: 'P = 60' },
    ],
    correctIndex: 2,
  },
  {
    id: 'l1q5',
    hu: 'Miért csökken a kereslet, ha a monopolista emeli az árat?',
    en: 'Why does demand fall when the monopolist raises price?',
    options: [
      { hu: 'Mert a vevők másik monopolistához mennek', en: 'Because buyers go to another monopolist' },
      { hu: 'Mert a keresleti görbe negatív meredekségű', en: 'Because the demand curve slopes downward' },
      { hu: 'Mert a határköltség is nő', en: 'Because marginal cost also rises' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l1q6',
    hu: 'Mit mutat az MR görbe?',
    en: 'What does the MR curve show?',
    options: [
      { hu: 'Az utolsó eladott egységért kapott árat', en: 'The price received for the last unit sold' },
      { hu: 'Az utolsó eladott egység által hozzáadott bevételt', en: 'The additional revenue from selling one more unit' },
      { hu: 'Az összes bevételt', en: 'Total revenue' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l1q7',
    hu: 'Miért MR < P az egyárú monopóliumnál?',
    en: 'Why is MR < P for a single-price monopolist?',
    options: [
      { hu: 'Mert a monopolista nem tud eladni minden áron', en: "Because the monopolist can't sell at any price" },
      { hu: 'Mert az ár csökkentésekor az összes korábbi egységen is kevesebbet kap', en: 'Because lowering price reduces revenue on all previous units too' },
      { hu: 'Mert a határköltség alacsony', en: 'Because marginal cost is low' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l1q8',
    hu: 'Mi történik a fogyasztói többlettel (CS) monopoliumnál a versenyhez képest?',
    en: 'What happens to consumer surplus (CS) under monopoly vs competition?',
    options: [
      { hu: 'CS nő', en: 'CS increases' },
      { hu: 'CS csökken', en: 'CS decreases' },
      { hu: 'CS nem változik', en: 'CS stays the same' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l1q9',
    hu: 'Melyik valós példa egyárú monopólium?',
    en: 'Which real-world example is a single-price monopoly?',
    options: [
      { hu: 'Szupermarket', en: 'Supermarket' },
      { hu: 'Egyetlen büfé egy fesztiválon', en: 'A single food stall at a festival' },
      { hu: 'Tökéletes verseny', en: 'Perfect competition' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l1q10',
    hu: 'Hogyan számítjuk a monopolista profitját?',
    en: 'How is monopolist profit calculated?',
    options: [
      { hu: 'π = TR + TC', en: 'π = TR + TC' },
      { hu: 'π = P × Q', en: 'π = P × Q' },
      { hu: 'π = (P − MC) × Q', en: 'π = (P − MC) × Q' },
    ],
    correctIndex: 2,
  },
]

export const LEVEL2_QUIZ: QuizQuestion[] = [
  {
    id: 'l2q1',
    hu: 'Mi a harmadfokú árdiszkrimináció?',
    en: 'What is third-degree price discrimination?',
    options: [
      { hu: 'Mindenki ugyanolyan árat fizet', en: 'Everyone pays the same price' },
      { hu: 'Megfigyelhető csoportoknak különböző árat szabnak', en: 'Different prices for identifiable groups' },
      { hu: 'A vevők saját maguk választanak csomagot', en: 'Buyers self-select into bundles' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l2q2',
    hu: 'Melyik csoportnak szabunk magasabb árat?',
    en: 'Which group is charged a higher price?',
    options: [
      { hu: 'A rugalmasabb csoportnak', en: 'The more price-elastic group' },
      { hu: 'A rugalmatlanabb csoportnak', en: 'The less price-elastic group' },
      { hu: 'A nagyobb csoportnak', en: 'The larger group' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l2q3',
    hu: 'Mi az arbitrázs és miért veszélyes?',
    en: 'What is arbitrage and why is it a threat?',
    options: [
      { hu: 'Állami árellenőrzés', en: 'Government price control' },
      { hu: 'Amikor az olcsóbb csoport vevői tovább adják a terméket a drágább csoportnak', en: 'When low-price group buyers resell to the high-price group' },
      { hu: 'A monopolista önkéntes árengedménye', en: "The monopolist's voluntary discount" },
    ],
    correctIndex: 1,
  },
  {
    id: 'l2q4',
    hu: 'Melyik példa harmadfokú árdiszkrimináció?',
    en: 'Which is an example of 3rd-degree price discrimination?',
    options: [
      { hu: 'Mennyiségi kedvezmény', en: 'Quantity discount' },
      { hu: 'Diákjegy vs. felnőtt jegy', en: 'Student ticket vs. adult ticket' },
      { hu: 'Aukció', en: 'Auction' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l2q5',
    hu: 'Ha a diákok keresleti görbéje P = 60 − Q és MC = 20, mi a profit-maximalizáló ár?',
    en: "If students' demand is P = 60 − Q and MC = 20, what price maximises profit?",
    options: [
      { hu: 'P = 20', en: 'P = 20' },
      { hu: 'P = 40', en: 'P = 40' },
      { hu: 'P = 60', en: 'P = 60' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l2q6',
    hu: 'Miért lehet, hogy az árdiszkrimináció NÖVELI a jólétet?',
    en: 'Why might price discrimination INCREASE welfare?',
    options: [
      { hu: 'Mert a monopolista profitja nő', en: 'Because monopolist profit rises' },
      { hu: 'Mert korábban kizárt vevők (pl. diákok) is vásárolhatnak', en: 'Because previously excluded buyers (e.g. students) can now buy' },
      { hu: 'Mert csökken a DWL minden esetben', en: 'Because DWL always falls' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l2q7',
    hu: 'A Lerner-index (L = (P−MC)/P) mit mér?',
    en: 'What does the Lerner index (L = (P−MC)/P) measure?',
    options: [
      { hu: 'A fogyasztói többletet', en: 'Consumer surplus' },
      { hu: 'A piaci erő mértékét — minél nagyobb, annál rugalmatlanabb a kereslet', en: 'Market power — higher means less elastic demand' },
      { hu: 'A profitmarzst összesen', en: 'Total profit margin' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l2q8',
    hu: 'Ha egységes árat kellene szabni, melyiket érdemes a kétcsoportos piacon?',
    en: 'If forced to use a single price on a two-group market, which to choose?',
    options: [
      { hu: 'Mindig az alacsonyabb árat', en: 'Always the lower price' },
      { hu: 'Az árat, amelyik a magasabb profitot adja — jellemzően a rugalmatlan csoport ára', en: "The price yielding higher profit — typically the inelastic group's price" },
      { hu: 'A két csoport átlagát', en: 'The average of both prices' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l2q9',
    hu: 'Üzleti vs. turistaosztály repülőn: melyik csoport rugalmatlanabb?',
    en: 'Business vs. economy class on a plane: which group is less price-elastic?',
    options: [
      { hu: 'Turisták', en: 'Tourists' },
      { hu: 'Üzleti utasok', en: 'Business travellers' },
      { hu: 'Mindkettő egyforma', en: 'Both the same' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l2q10',
    hu: 'Mit kell a monopolistának garantálnia az árdiszkriminációhoz?',
    en: 'What must the monopolist ensure for price discrimination to work?',
    options: [
      { hu: 'A két csoport ne tudja egymásnak tovább adni a terméket (nincs arbitrázs)', en: 'No resale between groups (no arbitrage)' },
      { hu: 'Az árak nyilvánosak legyenek', en: 'Prices must be public' },
      { hu: 'Mindkét csoport ugyanannyit keressen', en: 'Both groups earn the same' },
    ],
    correctIndex: 0,
  },
]

export const LEVEL3_QUIZ: QuizQuestion[] = [
  {
    id: 'l3q1',
    hu: 'Mi a másodfokú árdiszkrimináció lényege?',
    en: 'What is the essence of 2nd-degree price discrimination?',
    options: [
      { hu: 'A cég figyeli és besorolja a vevőket', en: 'The firm observes and classifies buyers' },
      { hu: 'A vevők saját maguk sorolják be magukat a csomagválasztással', en: 'Buyers self-select via their package choice' },
      { hu: 'Mindenki ugyanolyan csomagot vesz', en: 'Everyone buys the same package' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l3q2',
    hu: "Mi az 'információs járadék'?",
    en: "What is 'information rent'?",
    options: [
      { hu: 'A cég profitjának egy része', en: "Part of the firm's profit" },
      { hu: 'A magas WTP-jű vevők által megtartott többlet, amit a cég nem tud elvonni', en: "The surplus high-WTP buyers keep, which the firm cannot extract" },
      { hu: 'Állami szabályozási díj', en: 'A government regulatory fee' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l3q3',
    hu: 'Miért teszi szándékosan rosszabbá a cég az alapcsomagot?',
    en: 'Why does the firm intentionally make the basic package worse?',
    options: [
      { hu: 'Mert olcsóbb gyártani', en: "Because it's cheaper to produce" },
      { hu: 'Hogy csökkentse a prémium csomag vonzerejét az alacsony WTP-jű vevőknél, így magasabb prémium árat szabhat', en: "To reduce the premium's appeal to low-WTP buyers, enabling a higher premium price" },
      { hu: 'Mert az alapcsomag iránt amúgy nincs kereslet', en: "Because there's no demand for the basic package anyway" },
    ],
    correctIndex: 1,
  },
  {
    id: 'l3q4',
    hu: "Mi történik, ha a Prémium ára meghaladja a magas WTP-jű vevő 'Information rent + Basic value' összegét?",
    en: "What happens if Premium price exceeds high-WTP buyer's (information rent + basic value)?",
    options: [
      { hu: 'A magas WTP-jű vevő mégis Prémiumot vesz', en: 'High-WTP buyer still buys Premium' },
      { hu: 'A magas WTP-jű vevő inkább Basicet vesz (downgrade)', en: 'High-WTP buyer switches down to Basic' },
      { hu: 'A magas WTP-jű vevő kilép a piacról', en: 'High-WTP buyer exits the market' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l3q5',
    hu: 'Melyik NEM példa másodfokú árdiszkriminációra?',
    en: 'Which is NOT an example of 2nd-degree price discrimination?',
    options: [
      { hu: 'Szoftver Free / Pro verziók', en: 'Software Free/Pro versions' },
      { hu: 'Vasúti diákkedvezmény', en: 'Student rail discount' },
      { hu: 'Economy / Business repülőosztályok', en: 'Economy/Business airline classes' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l3q6',
    hu: 'Ha Basic = 50, Prémium = 110, és egy erős WTP-jű vevő 140-et értékel Prémiumra és 80-at Basicre, mit vesz?',
    en: 'If Basic = 50, Premium = 110, and a high-WTP buyer values Premium at 140 and Basic at 80, what do they buy?',
    options: [
      { hu: 'Prémium', en: 'Premium' },
      { hu: 'Basic', en: 'Basic' },
      { hu: 'Semmit', en: 'Nothing' },
    ],
    correctIndex: 0,
  },
  {
    id: 'l3q7',
    hu: 'Miért marad meg az erős vevőnél információs járadék az optimális menüben?',
    en: 'Why does information rent survive for high-WTP buyers in the optimal menu?',
    options: [
      { hu: 'Mert a cég nem tudja megkülönböztetni a csoportokat', en: "Because the firm can't tell groups apart" },
      { hu: 'Mert a cég szándékosan jutalmazza őket', en: 'Because the firm intentionally rewards them' },
      { hu: 'Mert törvény előírja', en: 'Because law requires it' },
    ],
    correctIndex: 0,
  },
  {
    id: 'l3q8',
    hu: "Mit jelent az 'önszelekció-kompatibilis ösztönző feltétel' (IC)?",
    en: "What does the 'incentive compatibility constraint' (IC) mean?",
    options: [
      { hu: 'A cég csak azokat szolgálja ki, akik vásárolni akarnak', en: 'Firm only serves willing buyers' },
      { hu: 'Minden típusú vevőnek érdekében kell állnia a neki szánt csomag választása', en: 'Each buyer type must prefer their intended package' },
      { hu: 'A cég kénytelen a vevők preferenciáit követni', en: 'The firm must follow buyer preferences' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l3q9',
    hu: 'Spotify Free vs. Premium: melyik árdiszkrimináció típus?',
    en: 'Spotify Free vs. Premium: which type of price discrimination?',
    options: [
      { hu: 'Harmadfokú (3rd degree)', en: '3rd degree' },
      { hu: 'Másodfokú (2nd degree) — verziózás', en: '2nd degree — versioning' },
      { hu: 'Elsőfokú (1st degree)', en: '1st degree' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l3q10',
    hu: "Mi a 'menütervezés' célja a cég szempontjából?",
    en: "What is the goal of 'menu design' from the firm's perspective?",
    options: [
      { hu: 'Maximalizálni a fogyasztói többletet', en: 'Maximise consumer surplus' },
      { hu: 'Maximalizálni a profitot úgy, hogy minden vevőtípus a számára tervezett csomagot válassza', en: 'Maximise profit while ensuring each buyer type self-selects their intended package' },
      { hu: 'Minimalizálni a termelési költségeket', en: 'Minimise production costs' },
    ],
    correctIndex: 1,
  },
]

export const LEVEL4_QUIZ: QuizQuestion[] = [
  {
    id: 'l4q1',
    hu: 'Mi a tökéletes (elsőfokú) árdiszkrimináció?',
    en: 'What is perfect (1st-degree) price discrimination?',
    options: [
      { hu: 'Csoportoknak különböző árat szabnak', en: 'Different prices for groups' },
      { hu: 'Minden vevőtől a maximális fizetési hajlandóságát kérik', en: 'Each buyer pays exactly their willingness to pay' },
      { hu: 'Egységes árat alkalmaznak', en: 'A single price is charged' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l4q2',
    hu: 'Mekkora a DWL tökéletes árdiszkriminációnál?',
    en: 'How large is DWL under perfect price discrimination?',
    options: [
      { hu: 'Maximális', en: 'Maximum' },
      { hu: 'Nulla — minden hatékony csere megvalósul', en: 'Zero — all efficient trades occur' },
      { hu: 'Azonos az egyárú monopóliuméval', en: 'Same as single-price monopoly' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l4q3',
    hu: 'Mi a tökéletes árdiszkrimináció paradoxona?',
    en: 'What is the paradox of perfect price discrimination?',
    options: [
      { hu: 'Hatékonytalan, de a vevők profitálnak', en: 'Inefficient, but buyers benefit' },
      { hu: 'Hatékony (DWL=0), de a CS=0 — minden értéktöbbletet a monopolista szerez meg', en: 'Efficient (DWL=0), but CS=0 — monopolist captures all surplus' },
      { hu: 'Hatékony és igazságos', en: 'Efficient and fair' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l4q4',
    hu: 'Ha P = 100 − Q és MC = 20, mennyi a profit tökéletes diszkriminációnál?',
    en: 'If P = 100 − Q and MC = 20, what is profit under perfect discrimination?',
    options: [
      { hu: '1600', en: '1600' },
      { hu: '2400', en: '2400' },
      { hu: '3200', en: '3200' },
    ],
    correctIndex: 2,
  },
  {
    id: 'l4q5',
    hu: 'Egy hatékony árplafon (P_cap = MC) milyen hatással van a monopóliumra?',
    en: 'What is the effect of an efficient price cap (P_cap = MC) on the monopoly?',
    options: [
      { hu: 'Csökkenti a kibocsátást', en: 'Reduces output' },
      { hu: 'Növeli a kibocsátást a versenyegyensúly szintjére és megszünteti a DWL-t', en: 'Increases output to competitive level, eliminating DWL' },
      { hu: 'Nem változtat semmit', en: 'Changes nothing' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l4q6',
    hu: 'Mi történik, ha az árplafon a határköltség alá kerül?',
    en: 'What happens if the price cap falls below marginal cost?',
    options: [
      { hu: 'Még több termelés', en: 'Even more production' },
      { hu: 'Hiány alakul ki — a cégnek nem éri meg termelni', en: 'Shortage occurs — production becomes unprofitable' },
      { hu: 'Optimális versenyegyensúly', en: 'Optimal competitive equilibrium' },
    ],
    correctIndex: 1,
  },
  {
    id: 'l4q7',
    hu: 'Verseny, egyárú monopólium és tökéletes diszkrimináció: melyiknél legnagyobb a PS?',
    en: 'Competition, single-price monopoly, perfect discrimination: where is PS highest?',
    options: [
      { hu: 'Versenynél', en: 'Under competition' },
      { hu: 'Egyárú monopóliumnál', en: 'Single-price monopoly' },
      { hu: 'Tökéletes árdiszkriminációnál', en: 'Perfect price discrimination' },
    ],
    correctIndex: 2,
  },
  {
    id: 'l4q8',
    hu: 'Mennyit termel a tökéletes diszkriminátor L1 piacán (P=100−Q, MC=20)?',
    en: "How much does a perfect discriminator produce in L1's market (P=100−Q, MC=20)?",
    options: [
      { hu: 'Q = 40', en: 'Q = 40' },
      { hu: 'Q = 60', en: 'Q = 60' },
      { hu: 'Q = 80', en: 'Q = 80' },
    ],
    correctIndex: 2,
  },
  {
    id: 'l4q9',
    hu: 'Miért nehéz a valóságban megvalósítani a tökéletes árdiszkriminációt?',
    en: 'Why is perfect price discrimination hard to achieve in practice?',
    options: [
      { hu: 'Törvényellenes', en: "It's illegal" },
      { hu: 'A cég nem ismeri minden vevő pontos fizetési hajlandóságát', en: "The firm doesn't know each buyer's exact willingness to pay" },
      { hu: 'A fogyasztók nem vásárolnak ilyen esetben', en: "Consumers won't buy under these conditions" },
    ],
    correctIndex: 1,
  },
  {
    id: 'l4q10',
    hu: 'Algoritmusos személyre szabott árazás (pl. légitársaságoknál) melyik diszkrimináció típushoz hasonlít?',
    en: 'Algorithmic personalised pricing (e.g. airlines) resembles which discrimination type?',
    options: [
      { hu: 'Másodfokú / 2nd degree', en: '2nd degree' },
      { hu: 'Harmadfokú / 3rd degree', en: '3rd degree' },
      { hu: 'Elsőfokú / 1st degree (tökéletes)', en: '1st degree (perfect)' },
    ],
    correctIndex: 2,
  },
]

export function pickQuestions(pool: QuizQuestion[], n = 3): QuizQuestion[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}
