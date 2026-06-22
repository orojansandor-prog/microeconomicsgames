/**
 * Gazdasági motor — Monopólium játék
 * DETERMINISZTIKUS: Claude soha nem számol. Ez a validitási gerinc.
 * Lineáris kereslet: P = A - B*Q
 */

export interface MarketParams {
  /** Kereslet intercept: ha Q=0, P=A */
  A: number
  /** Kereslet meredeksége (pozitív: P csökken Q-val) */
  B: number
  /** Határköltség (konstans) */
  MC: number
  /** Fix költség */
  FC?: number
}

export interface MarketResult {
  // Monopólium egyensúly
  Q_monopoly: number
  P_monopoly: number
  TR_monopoly: number
  TC_monopoly: number
  profit_monopoly: number
  CS_monopoly: number
  PS_monopoly: number
  DWL: number

  // Versenypiaci egyensúly (referencia)
  Q_competitive: number
  P_competitive: number
  profit_competitive: number
  CS_competitive: number
  PS_competitive: number

  // Segédadatok grafikonhoz
  MR_at_Q_monopoly: number
  demand_intercept_Q: number // ahol P=0
}

export interface LevelTwoResult {
  // 1. piac
  Q1: number; P1: number; profit1: number; CS1: number
  // 2. piac
  Q2: number; P2: number; profit2: number; CS2: number
  // Összesített
  Q_total: number
  profit_total: number
  CS_total: number
  DWL1: number; DWL2: number
}

export interface PriceCapResult {
  P_cap: number
  Q_cap: number
  profit_capped: number
  CS_capped: number
  PS_capped: number
  DWL_capped: number
  isEfficient: boolean
}

// ─── Alap segédfüggvények ─────────────────────────────────────

/** Kereslet: Q adott P-nél */
export function demandQ(A: number, B: number, P: number): number {
  return Math.max(0, (A - P) / B)
}

/** Inverz kereslet: P adott Q-nál */
export function inverseP(A: number, B: number, Q: number): number {
  return Math.max(0, A - B * Q)
}

/** Határbevétel adott Q-nál */
export function marginalRevenue(A: number, B: number, Q: number): number {
  return A - 2 * B * Q
}

// ─── 1. SZINT: Monopólium alapeset ───────────────────────────

export function solveMonopoly(params: MarketParams): MarketResult {
  const { A, B, MC, FC = 0 } = params

  // Monopólium: MR = MC → A - 2BQ = MC → Q* = (A-MC)/(2B)
  const Q_m = Math.max(0, (A - MC) / (2 * B))
  const P_m = inverseP(A, B, Q_m)
  const TR_m = P_m * Q_m
  const TC_m = MC * Q_m + FC
  const profit_m = TR_m - TC_m
  const CS_m = 0.5 * (A - P_m) * Q_m
  const PS_m = (P_m - MC) * Q_m

  // Versenypiaci: P = MC → Q_c = (A-MC)/B
  const Q_c = Math.max(0, (A - MC) / B)
  const P_c = MC
  const CS_c = 0.5 * (A - P_c) * Q_c
  const PS_c = 0
  const profit_c = FC > 0 ? -FC : 0

  // DWL = 0.5 * (P_m - MC) * (Q_c - Q_m)
  const DWL = 0.5 * (P_m - MC) * (Q_c - Q_m)

  return {
    Q_monopoly: round(Q_m),
    P_monopoly: round(P_m),
    TR_monopoly: round(TR_m),
    TC_monopoly: round(TC_m),
    profit_monopoly: round(profit_m),
    CS_monopoly: round(CS_m),
    PS_monopoly: round(PS_m),
    DWL: round(DWL),
    Q_competitive: round(Q_c),
    P_competitive: round(P_c),
    profit_competitive: round(profit_c),
    CS_competitive: round(CS_c),
    PS_competitive: round(PS_c),
    MR_at_Q_monopoly: round(marginalRevenue(A, B, Q_m)),
    demand_intercept_Q: round(A / B),
  }
}

// ─── 2. SZINT: Árdiszkrimináció (3. fokú) ──────────────────

export function solvePriceDiscrimination(
  market1: MarketParams,
  market2: MarketParams,
): LevelTwoResult {
  const r1 = solveMonopoly(market1)
  const r2 = solveMonopoly(market2)

  // Versenypiaci Q a DWL-hez
  const Qc1 = (market1.A - market1.MC) / market1.B
  const Qc2 = (market2.A - market2.MC) / market2.B

  const DWL1 = 0.5 * (r1.P_monopoly - market1.MC) * (Qc1 - r1.Q_monopoly)
  const DWL2 = 0.5 * (r2.P_monopoly - market2.MC) * (Qc2 - r2.Q_monopoly)

  return {
    Q1: r1.Q_monopoly, P1: r1.P_monopoly,
    profit1: r1.profit_monopoly, CS1: r1.CS_monopoly,
    Q2: r2.Q_monopoly, P2: r2.P_monopoly,
    profit2: r2.profit_monopoly, CS2: r2.CS_monopoly,
    Q_total: round(r1.Q_monopoly + r2.Q_monopoly),
    profit_total: round(r1.profit_monopoly + r2.profit_monopoly),
    CS_total: round(r1.CS_monopoly + r2.CS_monopoly),
    DWL1: round(DWL1),
    DWL2: round(DWL2),
  }
}

// ─── 4. SZINT: Árplafon (szabályozás) ──────────────────────

export function solvePriceCap(
  params: MarketParams,
  P_cap: number,
): PriceCapResult {
  const { A, B, MC, FC = 0 } = params
  const base = solveMonopoly(params)

  // Ha a plafon magasabb mint a monopólium ár → nincs hatás
  if (P_cap >= base.P_monopoly) {
    return {
      P_cap: base.P_monopoly,
      Q_cap: base.Q_monopoly,
      profit_capped: base.profit_monopoly,
      CS_capped: base.CS_monopoly,
      PS_capped: base.PS_monopoly,
      DWL_capped: base.DWL,
      isEfficient: false,
    }
  }

  // Árplafon hatása: P = P_cap, Q = (A - P_cap) / B
  const Q_cap = Math.max(0, (A - P_cap) / B)
  const TR_cap = P_cap * Q_cap
  const TC_cap = MC * Q_cap + FC
  const profit_cap = TR_cap - TC_cap
  const CS_cap = 0.5 * (A - P_cap) * Q_cap
  const PS_cap = (P_cap - MC) * Q_cap

  const Q_c = (A - MC) / B
  const DWL_cap = P_cap <= MC ? 0 : 0.5 * (P_cap - MC) * (Q_c - Q_cap)

  return {
    P_cap: round(P_cap),
    Q_cap: round(Q_cap),
    profit_capped: round(profit_cap),
    CS_capped: round(CS_cap),
    PS_capped: round(PS_cap),
    DWL_capped: round(DWL_cap),
    isEfficient: Math.abs(P_cap - MC) < 0.01,
  }
}

// ─── Táblázat generátor (leleplezés) ───────────────────────

export interface TableRow {
  Q: number; P: number; TR: number; MR: number | null; MC: number
  profit: number
}

export function generateTable(params: MarketParams, steps = 10, extraQ: number[] = []): TableRow[] {
  const { A, B, MC, FC = 0 } = params
  const Q_max = A / B
  const step = Q_max / steps

  // Alap Q értékek + kötelező extra pontok (pl. pontos optimum)
  const baseQ = Array.from({ length: steps + 1 }, (_, i) => round(i * step))
  const allQ = [...baseQ, ...extraQ]
    .sort((a, b) => a - b)
    .filter((q, i, arr) => i === 0 || Math.abs(q - arr[i - 1]) > 0.1)

  return allQ.map((Q, i) => {
    const P = round(inverseP(A, B, Q))
    const TR = round(P * Q)
    const MR = i === 0 ? null : round(A - 2 * B * Q)
    const profit = round(TR - MC * Q - FC)
    return { Q, P, TR, MR, MC, profit }
  })
}

// ─── Segédfüggvény ─────────────────────────────────────────

function round(x: number, decimals = 2): number {
  return Math.round(x * 10 ** decimals) / 10 ** decimals
}
