// costs.ts
// Deterministic costs engine — pure math, no LLM.
// Bakery scenario: FC = 100 Ft/day

function r2(x: number): number {
  return Math.round(x * 10) / 10
}

export interface CostRow {
  Q: number
  TC: number
  FC: number
  VC: number
  MC: number | null   // null at Q=0
  ATC: number | null  // null at Q=0
  AVC: number | null  // null at Q=0
  AFC: number | null  // null at Q=0
}

// Pre-computed TC values (from VC schedule designed for nice U-shaped curves)
const TC_VALUES = [100, 150, 190, 220, 244, 265, 292, 331, 388, 469, 580]

export const COST_SCHEDULE: CostRow[] = TC_VALUES.map((tc, q) => {
  const fc = 100
  const vc = tc - fc
  const mc = q === 0 ? null : r2(tc - TC_VALUES[q - 1])
  const atc = q === 0 ? null : r2(tc / q)
  const avc = q === 0 ? null : r2(vc / q)
  const afc = q === 0 ? null : r2(fc / q)
  return { Q: q, TC: tc, FC: fc, VC: vc, MC: mc, ATC: atc, AVC: avc, AFC: afc }
})

export const FC = 100
export const MIN_MC = 21
export const Q_MIN_MC = 5
export const MIN_AVC = 32
export const Q_MIN_AVC = 6
export const MIN_ATC = 47.3
export const Q_MIN_ATC = 7

// Find profit-maximizing Q given market price P
// Produce while MC <= P; stop when next MC > P
// If P < MIN_AVC: shut down (return 0)
export function findOptimalQ(price: number): number {
  if (price < MIN_AVC) return 0
  let bestQ = 0
  for (let q = 1; q <= 10; q++) {
    const mc = COST_SCHEDULE[q].MC!
    if (mc <= price) bestQ = q
    else break
  }
  return bestQ
}

export function computeProfit(Q: number, price: number): number {
  if (Q === 0) return -FC
  const tc = COST_SCHEDULE[Q].TC
  return price * Q - tc
}

export function shouldShutDown(price: number): boolean {
  return price < MIN_AVC
}
