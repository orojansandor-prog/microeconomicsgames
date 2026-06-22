// supply-demand.ts
// Deterministic supply-demand engine — pure math, no randomness, no LLM.
// Linear supply: P = C + Bs*Q
// Linear demand: P = A - Bd*Q

function round(x: number, decimals = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(x * factor) / factor
}

// ---------------------------------------------------------------------------
// Params & core interfaces
// ---------------------------------------------------------------------------

export interface SDParams {
  A: number  // demand intercept
  Bd: number // demand slope
  C: number  // supply intercept
  Bs: number // supply slope
}

export interface EquilibriumResult {
  Q: number
  P: number
  CS: number
  PS: number
  TS: number
  DWL: number
}

// ---------------------------------------------------------------------------
// Competitive equilibrium
// ---------------------------------------------------------------------------

export function solveEquilibrium(p: SDParams): EquilibriumResult {
  // A - Bd*Q = C + Bs*Q  →  Q* = (A-C)/(Bd+Bs)
  const Q = round((p.A - p.C) / (p.Bd + p.Bs))
  const P = round(p.A - p.Bd * Q)
  // CS = integral from 0 to Q* of (demand - P*) dQ
  //    = (A - P*)*Q* - Bd*Q*^2/2
  const CS = round((p.A - P) * Q - (p.Bd * Q * Q) / 2)
  // PS = integral from 0 to Q* of (P* - supply) dQ
  //    = (P* - C)*Q* - Bs*Q*^2/2
  const PS = round((P - p.C) * Q - (p.Bs * Q * Q) / 2)
  const TS = round(CS + PS)
  const DWL = 0
  return { Q, P, CS, PS, TS, DWL }
}

// ---------------------------------------------------------------------------
// Curve shift
// ---------------------------------------------------------------------------

export interface ShiftResult extends EquilibriumResult {
  deltaQ: number
  deltaP: number
  deltaCS: number
  deltaPS: number
}

export function solveShift(original: SDParams, shifted: SDParams): ShiftResult {
  const orig = solveEquilibrium(original)
  const newEq = solveEquilibrium(shifted)
  return {
    ...newEq,
    deltaQ: round(newEq.Q - orig.Q),
    deltaP: round(newEq.P - orig.P),
    deltaCS: round(newEq.CS - orig.CS),
    deltaPS: round(newEq.PS - orig.PS),
  }
}

// ---------------------------------------------------------------------------
// Price ceiling
// ---------------------------------------------------------------------------

export interface InterventionResult {
  type: 'ceiling' | 'floor'
  P_control: number
  Qd: number
  Qs: number
  Q_traded: number
  shortage_surplus: number
  CS: number
  PS: number
  DWL: number
  TS: number
}

export function solvePriceCeiling(p: SDParams, P_ceil: number): InterventionResult {
  const eq = solveEquilibrium(p)

  // Quantities at the controlled price
  const Qd = round((p.A - P_ceil) / p.Bd)
  const Qs = round((P_ceil - p.C) / p.Bs)
  const Q_traded = round(Math.min(Qd, Qs))
  const shortage_surplus = round(Qd - Qs) // positive = shortage

  // CS = integral from 0 to Q_traded of (demand - P_ceil) dQ
  //    = (A - P_ceil)*Q_traded - Bd*Q_traded^2/2
  const CS = round((p.A - P_ceil) * Q_traded - (p.Bd * Q_traded * Q_traded) / 2)

  // PS = integral from 0 to Q_traded of (P_ceil - supply) dQ
  //    = (P_ceil - C)*Q_traded - Bs*Q_traded^2/2
  const PS = round((P_ceil - p.C) * Q_traded - (p.Bs * Q_traded * Q_traded) / 2)

  const TS = round(CS + PS)
  const DWL = round(eq.TS - TS)

  return {
    type: 'ceiling',
    P_control: P_ceil,
    Qd,
    Qs,
    Q_traded,
    shortage_surplus,
    CS,
    PS,
    DWL,
    TS,
  }
}

// ---------------------------------------------------------------------------
// Price floor
// ---------------------------------------------------------------------------

export function solvePriceFloor(p: SDParams, P_floor: number): InterventionResult {
  const eq = solveEquilibrium(p)

  const Qs = round((P_floor - p.C) / p.Bs)
  const Qd = round((p.A - P_floor) / p.Bd)
  const Q_traded = round(Math.min(Qd, Qs))
  const shortage_surplus = round(Qs - Qd) // positive = surplus

  // CS = integral from 0 to Q_traded of (demand - P_floor) dQ
  const CS = round((p.A - P_floor) * Q_traded - (p.Bd * Q_traded * Q_traded) / 2)

  // PS = integral from 0 to Q_traded of (P_floor - supply) dQ
  const PS = round((P_floor - p.C) * Q_traded - (p.Bs * Q_traded * Q_traded) / 2)

  const TS = round(CS + PS)
  const DWL = round(eq.TS - TS)

  return {
    type: 'floor',
    P_control: P_floor,
    Qd,
    Qs,
    Q_traded,
    shortage_surplus,
    CS,
    PS,
    DWL,
    TS,
  }
}

// ---------------------------------------------------------------------------
// Unit tax
// ---------------------------------------------------------------------------

export interface TaxResult {
  t: number
  Q: number
  P_buyer: number
  P_seller: number
  CS: number
  PS: number
  tax_revenue: number
  DWL: number
  TS: number
  buyer_burden: number
  seller_burden: number
}

export function solveTax(p: SDParams, t: number): TaxResult {
  const eq = solveEquilibrium(p)

  // P_buyer - P_seller = t, both on same Q
  // A - Bd*Q = (C + Bs*Q) + t  →  Q = (A - C - t) / (Bd + Bs)
  const Q = round((p.A - p.C - t) / (p.Bd + p.Bs))
  const P_buyer = round(p.A - p.Bd * Q)
  const P_seller = round(P_buyer - t)

  // CS = integral from 0 to Q of (demand - P_buyer) dQ
  const CS = round((p.A - P_buyer) * Q - (p.Bd * Q * Q) / 2)

  // PS = integral from 0 to Q of (P_seller - supply) dQ
  const PS = round((P_seller - p.C) * Q - (p.Bs * Q * Q) / 2)

  const tax_revenue = round(t * Q)
  const TS = round(CS + PS + tax_revenue)
  const DWL = round(eq.TS - TS)

  const buyer_burden = round(P_buyer - eq.P)
  const seller_burden = round(eq.P - P_seller)

  return {
    t,
    Q,
    P_buyer,
    P_seller,
    CS,
    PS,
    tax_revenue,
    DWL,
    TS,
    buyer_burden,
    seller_burden,
  }
}

// ---------------------------------------------------------------------------
// Schedule table
// ---------------------------------------------------------------------------

export interface SDTableRow {
  Q: number
  P_demand: number
  P_supply: number
  surplus_shortage: number
}

export function generateSDTable(p: SDParams, steps = 10): SDTableRow[] {
  const rows: SDTableRow[] = []
  const step = (p.A - p.C) / steps
  for (let i = 0; i <= steps; i++) {
    const Q = round(i * step)
    const P_demand = round(p.A - p.Bd * Q)
    const P_supply = round(p.C + p.Bs * Q)
    // positive = surplus (supply > demand), negative = shortage (demand > supply)
    const surplus_shortage = round(P_supply - P_demand)
    rows.push({ Q, P_demand, P_supply, surplus_shortage })
  }
  return rows
}
