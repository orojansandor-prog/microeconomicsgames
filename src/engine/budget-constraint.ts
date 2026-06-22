/**
 * Gazdasági motor — Fogyasztói elmélet (Budget Constraint + IC) játék
 * DETERMINISZTIKUS: Claude soha nem számol. Ez a validitási gerinc.
 * Cobb-Douglas hasznosság: U(X, Y) = X^alpha * Y^(1-alpha)
 */

function round(x: number, decimals = 2): number {
  return Math.round(x * 10 ** decimals) / 10 ** decimals
}

// ─── Paraméterek ──────────────────────────────────────────────────

export interface BCParams {
  I: number      // jövedelem (Ft)
  Px: number     // X jószág ára (Ft)
  Py: number     // Y jószág ára (Ft)
  alpha: number  // Cobb-Douglas részarány (0 < alpha < 1)
  labelX: string // pl. "kávé"
  labelY: string // pl. "tea"
}

// ─── Budget constraint ────────────────────────────────────────────

/**
 * Budget line: Y(X) = (I - Px*X) / Py
 * Ha X > I/Px → negatív Y (infeasible)
 */
export function budgetY(p: BCParams, X: number): number {
  return (p.I - p.Px * X) / p.Py
}

/** X-tengellyel való metszéspontja a budget line-nak */
export function xIntercept(p: BCParams): number {
  return round(p.I / p.Px)
}

/** Y-tengellyel való metszéspontja */
export function yIntercept(p: BCParams): number {
  return round(p.I / p.Py)
}

/** Meredekség: -Px/Py (opportunity cost) */
export function budgetSlope(p: BCParams): number {
  return round(-p.Px / p.Py)
}

/** Kiadás adott (X, Y) kosárnál */
export function spending(p: BCParams, X: number, Y: number): number {
  return round(p.Px * X + p.Py * Y)
}

// ─── Hasznosság és MRS ───────────────────────────────────────────

/**
 * Cobb-Douglas hasznosság: U = X^alpha * Y^(1-alpha)
 */
export function utilityAt(p: BCParams, X: number, Y: number): number {
  if (X <= 0 || Y <= 0) return 0
  return round(Math.pow(X, p.alpha) * Math.pow(Y, 1 - p.alpha))
}

/**
 * Helyettesítési határráta (MRS):
 * MRS = (alpha / (1-alpha)) * (Y / X)
 * = az 1 X egységről lemondani hajlandó Y mennyiség
 */
export function mrsAt(p: BCParams, X: number, Y: number): number {
  if (X <= 0) return Infinity
  return round((p.alpha / (1 - p.alpha)) * (Y / X))
}

// ─── Fogyasztói optimum ──────────────────────────────────────────

export interface OptimumResult {
  X_star: number    // optimális X mennyiség
  Y_star: number    // optimális Y mennyiség
  U_star: number    // maximális hasznosság
  MRS_star: number  // MRS az optimumban (= Px/Py)
  X_max: number     // budget line X-tengelymetszet
  Y_max: number     // budget line Y-tengelymetszet
  slope: number     // budget line meredeksége (-Px/Py)
  price_ratio: number // Px/Py
}

/**
 * Fogyasztói optimum (Cobb-Douglas belső megoldás):
 * X* = alpha * I / Px
 * Y* = (1-alpha) * I / Py
 * MRS* = Px/Py (érintési feltétel)
 */
export function solveOptimum(p: BCParams): OptimumResult {
  const X_star = round(p.alpha * p.I / p.Px)
  const Y_star = round((1 - p.alpha) * p.I / p.Py)
  return {
    X_star,
    Y_star,
    U_star: utilityAt(p, X_star, Y_star),
    MRS_star: mrsAt(p, X_star, Y_star),
    X_max: xIntercept(p),
    Y_max: yIntercept(p),
    slope: budgetSlope(p),
    price_ratio: round(p.Px / p.Py),
  }
}

// ─── IC görbe pontjai ─────────────────────────────────────────────

/**
 * U = const IC görbe pontjai: Y = (U / X^alpha)^(1/(1-alpha))
 */
export function icPoints(
  p: BCParams,
  U: number,
  steps = 80,
): Array<{ X: number; Y: number }> {
  const xMax = p.I / p.Px * 1.5
  const result: Array<{ X: number; Y: number }> = []
  for (let i = 1; i <= steps; i++) {
    const X = (xMax * i) / steps
    const Y = Math.pow(U / Math.pow(X, p.alpha), 1 / (1 - p.alpha))
    if (Y > 0 && Y < p.I / p.Py * 2.2 && isFinite(Y)) {
      result.push({ X: round(X, 3), Y: round(Y, 3) })
    }
  }
  return result
}

// ─── Feltáró tábla (leleplezés) ───────────────────────────────────

export interface BCTableRow {
  X: number
  Y: number
  spend: number
  U: number
  MRS: number
  price_ratio: number
  isOptimal: boolean
  label?: string
}

/**
 * Tábla: pontok A BUDGET LINE-ON különböző X értékeknél
 * Tartalmaz: X, Y, kiadás, hasznosság, MRS, Px/Py
 * Zöld sor = optimum
 */
export function generateBCTable(p: BCParams, steps = 8): BCTableRow[] {
  const opt = solveOptimum(p)
  const X_max = xIntercept(p)
  const rows: BCTableRow[] = []

  const xVals = Array.from({ length: steps + 1 }, (_, i) => round(X_max * i / steps))
  if (!xVals.some(x => Math.abs(x - opt.X_star) < 0.05)) {
    xVals.push(opt.X_star)
    xVals.sort((a, b) => a - b)
  }

  for (const X of xVals) {
    if (X <= 0 || X >= X_max) continue
    const Y = round(budgetY(p, X))
    if (Y <= 0) continue
    const U = utilityAt(p, X, Y)
    const MRS = mrsAt(p, X, Y)
    rows.push({
      X,
      Y,
      spend: spending(p, X, Y),
      U,
      MRS,
      price_ratio: round(p.Px / p.Py),
      isOptimal: Math.abs(X - opt.X_star) < 0.1 && Math.abs(Y - opt.Y_star) < 0.1,
    })
  }
  return rows
}

// ─── Slutsky-felbontás ────────────────────────────────────────────

export interface SlutskyResult {
  // Eredeti optimum
  X_orig: number
  Y_orig: number
  U_orig: number
  I_orig: number
  Px_orig: number
  // Új egyensúly (megváltozott ár, eredeti jövedelem)
  X_new: number
  Y_new: number
  U_new: number
  I_new: number
  Px_new: number
  // Slutsky-kompenzált (eredeti kosarat engedheti meg magának az új áron)
  X_slutsky: number
  Y_slutsky: number
  I_slutsky: number
  // Hatások
  substitution_effect: number  // X_slutsky - X_orig (tiszta árhatás, rögzített vásárlóerő)
  income_effect: number        // X_new - X_slutsky (jövedelemhatás)
  total_effect: number         // X_new - X_orig
}

/**
 * Slutsky-felbontás:
 * Az X jószág ára Px → Px_new változik (Py és I változatlan)
 *
 * Kompenzált jövedelem: I_s = Px_new * X* + Py * Y*
 * (annyit kap, hogy az eredeti kosarat megvehesse az új áron)
 *
 * Helyettesítési hatás: X_s - X*  (kompenzált optimum - eredeti)
 * Jövedelemhatás:       X_new - X_s
 */
export function solveSlutskyDecomposition(p: BCParams, Px_new: number): SlutskyResult {
  const orig = solveOptimum(p)

  const newParams: BCParams = { ...p, Px: Px_new }
  const newOpt = solveOptimum(newParams)

  // Slutsky-kompenzált jövedelem
  const I_s = round(Px_new * orig.X_star + p.Py * orig.Y_star)
  const sParams: BCParams = { ...p, Px: Px_new, I: I_s }
  const sOpt = solveOptimum(sParams)

  return {
    X_orig: orig.X_star,
    Y_orig: orig.Y_star,
    U_orig: orig.U_star,
    I_orig: p.I,
    Px_orig: p.Px,
    X_new: newOpt.X_star,
    Y_new: newOpt.Y_star,
    U_new: newOpt.U_star,
    I_new: p.I,
    Px_new,
    X_slutsky: sOpt.X_star,
    Y_slutsky: sOpt.Y_star,
    I_slutsky: I_s,
    substitution_effect: round(sOpt.X_star - orig.X_star),
    income_effect: round(newOpt.X_star - sOpt.X_star),
    total_effect: round(newOpt.X_star - orig.X_star),
  }
}

// ─── Szint-szcenáriók ─────────────────────────────────────────────

export const BASE_PARAMS: BCParams = {
  I: 4800,
  Px: 300,
  Py: 400,
  alpha: 0.5,
  labelX: 'kávé',
  labelY: 'tea',
}

/**
 * Level 2 kosarak: A és B azonos hasznosságon, C magasabb, D alacsonyabb
 * Trap: B-nek több az összes (X+Y=15 > A: 13), mégis azonos U-val bírnak
 */
export interface Basket {
  id: string
  X: number
  Y: number
  label: string
  emoji: string
}

export const LEVEL2_BASKETS: Basket[] = [
  { id: 'A', X: 4,  Y: 9,  label: 'A kosár', emoji: '🧺' },
  { id: 'B', X: 12, Y: 3,  label: 'B kosár', emoji: '🎒' },
  { id: 'C', X: 8,  Y: 6,  label: 'C kosár', emoji: '🛒' },
  { id: 'D', X: 2,  Y: 5,  label: 'D kosár', emoji: '👝' },
]
// Ellenőrzés: alpha=0.5, U=sqrt(X*Y)
// A: sqrt(36)=6, B: sqrt(36)=6 (UGYANANNYI!), C: sqrt(48)≈6.93 (legjobb), D: sqrt(10)≈3.16 (legrosszabb)
// Csapda: B-nek X+Y=15, A-nak X+Y=13 — mégis ugyanolyan jók!
