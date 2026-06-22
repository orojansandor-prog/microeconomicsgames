import type { BCParams } from './budget-constraint'

export interface BCScenario {
  id: string
  icon: string
  titleHu: string
  titleEn: string
  storyHu: string
  storyEn: string
  params: BCParams
  quizNx: number
  quizMy: number
  quizAnswerIsYes: boolean
  quizTextHu: string
  quizTextEn: string
  newPxMin: number
  newPxMax: number
  newPxDefault: number
}

export function pickBCRandom(arr: BCScenario[]): BCScenario {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const BC_SCENARIOS: BCScenario[] = [
  {
    id: 'cafe',
    icon: '☕',
    titleHu: 'A kávézóban',
    titleEn: 'At the café',
    storyHu: '4 800 Ft van a zsebedben. Kávé 300 Ft, tea 400 Ft. Melyikből mennyit választasz?',
    storyEn: 'You have 4,800 Ft. Coffee is 300 Ft, tea is 400 Ft. How much of each?',
    params: { I: 4800, Px: 300, Py: 400, alpha: 0.5, labelX: 'kávé', labelY: 'tea' },
    quizNx: 6,
    quizMy: 8,
    quizAnswerIsYes: false,
    quizTextHu: 'Vehetek 6 kávét és 8 teát? (6×300 + 8×400 = 5 000 Ft > 4 800 Ft)',
    quizTextEn: 'Can I buy 6 coffees and 8 teas? (6×300 + 8×400 = 5,000 Ft > 4,800 Ft)',
    newPxMin: 200,
    newPxMax: 600,
    newPxDefault: 450,
  },
  {
    id: 'pizzeria',
    icon: '🍕',
    titleHu: 'A pizzériában',
    titleEn: 'At the pizzeria',
    storyHu: '6 000 Ft van nálad. Pizza 600 Ft, hamburger 400 Ft. Melyikből mennyit rendelsz?',
    storyEn: 'You have 6,000 Ft. Pizza costs 600 Ft, burger 400 Ft. How many of each?',
    params: { I: 6000, Px: 600, Py: 400, alpha: 0.6, labelX: 'pizza', labelY: 'hamburger' },
    quizNx: 8,
    quizMy: 4,
    quizAnswerIsYes: false,
    quizTextHu: 'Vehetek 8 pizzát és 4 hamburgert? (8×600 + 4×400 = 6 400 Ft > 6 000 Ft)',
    quizTextEn: 'Can I buy 8 pizzas and 4 burgers? (8×600 + 4×400 = 6,400 Ft > 6,000 Ft)',
    newPxMin: 400,
    newPxMax: 1000,
    newPxDefault: 800,
  },
  {
    id: 'cinema',
    icon: '🎬',
    titleHu: 'Mozi és könyv',
    titleEn: 'Cinema and books',
    storyHu: '5 000 Ft-od van. Mozijegy 500 Ft, könyv 250 Ft. Melyikből mennyit veszel?',
    storyEn: 'You have 5,000 Ft. Cinema ticket 500 Ft, book 250 Ft. How many of each?',
    params: { I: 5000, Px: 500, Py: 250, alpha: 0.4, labelX: 'mozijegy', labelY: 'könyv' },
    quizNx: 5,
    quizMy: 11,
    quizAnswerIsYes: false,
    quizTextHu: 'Vehetek 5 mozijegyet és 11 könyvet? (5×500 + 11×250 = 5 250 Ft > 5 000 Ft)',
    quizTextEn: 'Can I buy 5 cinema tickets and 11 books? (5×500 + 11×250 = 5,250 Ft > 5,000 Ft)',
    newPxMin: 300,
    newPxMax: 800,
    newPxDefault: 700,
  },
  {
    id: 'sport',
    icon: '👟',
    titleHu: 'A sportboltban',
    titleEn: 'At the sports store',
    storyHu: '9 000 Ft-od van. Futócipő 900 Ft, sportruha 450 Ft. Melyikből mennyit veszel?',
    storyEn: 'You have 9,000 Ft. Running shoes 900 Ft, sportswear 450 Ft. How many?',
    params: { I: 9000, Px: 900, Py: 450, alpha: 0.5, labelX: 'futócipő', labelY: 'sportruha' },
    quizNx: 6,
    quizMy: 9,
    quizAnswerIsYes: false,
    quizTextHu: 'Vehetek 6 futócipőt és 9 sportruhát? (6×900 + 9×450 = 9 450 Ft > 9 000 Ft)',
    quizTextEn: 'Can I buy 6 pairs of shoes and 9 sportswear items? (6×900 + 9×450 = 9,450 Ft > 9,000 Ft)',
    newPxMin: 600,
    newPxMax: 1500,
    newPxDefault: 1200,
  },
  {
    id: 'restaurant',
    icon: '🍽️',
    titleHu: 'Étterem vs. gyorskaja',
    titleEn: 'Restaurant vs. fast food',
    storyHu: '8 000 Ft-od van. Éttermi adag 800 Ft, gyorskaja 400 Ft. Mit választasz?',
    storyEn: 'You have 8,000 Ft. Restaurant meal 800 Ft, fast food 400 Ft. What do you choose?',
    params: { I: 8000, Px: 800, Py: 400, alpha: 0.5, labelX: 'éttermi adag', labelY: 'gyorskaja' },
    quizNx: 6,
    quizMy: 9,
    quizAnswerIsYes: false,
    quizTextHu: 'Vehetek 6 éttermi adagot és 9 gyorskaját? (6×800 + 9×400 = 8 400 Ft > 8 000 Ft)',
    quizTextEn: 'Can I buy 6 restaurant meals and 9 fast food items? (6×800 + 9×400 = 8,400 Ft > 8,000 Ft)',
    newPxMin: 500,
    newPxMax: 1400,
    newPxDefault: 1100,
  },
]
