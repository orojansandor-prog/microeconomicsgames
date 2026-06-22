/**
 * Elasticity engine — deterministic, no LLM
 */

export function computePED(deltaQ_pct: number, deltaP_pct: number): number {
  return round(deltaQ_pct / deltaP_pct)
}

export function classifyPED(ped: number): 'elastic' | 'inelastic' | 'unit_elastic' {
  const abs = Math.abs(ped)
  if (abs > 1.001) return 'elastic'
  if (abs < 0.999) return 'inelastic'
  return 'unit_elastic'
}

export function computeTRChange(p1: number, q1: number, deltaP_pct: number, ped: number) {
  const p2 = p1 * (1 + deltaP_pct / 100)
  const q2 = q1 * (1 + (ped * deltaP_pct) / 100)
  const tr1 = round(p1 * q1)
  const tr2 = round(p2 * q2)
  const deltaAbs = round(tr2 - tr1)
  const direction: 'up' | 'down' | 'same' = deltaAbs > 0.01 ? 'up' : deltaAbs < -0.01 ? 'down' : 'same'
  return { tr1, tr2, deltaAbs, direction }
}

export function computePES(deltaQ_pct: number, deltaP_pct: number): number {
  return round(deltaQ_pct / deltaP_pct)
}

export function classifyPES(pes: number): 'elastic' | 'inelastic' | 'perfectly_inelastic' | 'perfectly_elastic' {
  if (pes === 0) return 'perfectly_inelastic'
  if (!isFinite(pes)) return 'perfectly_elastic'
  return pes > 1 ? 'elastic' : 'inelastic'
}

export function computeXED(deltaQA_pct: number, deltaPB_pct: number): number {
  return round(deltaQA_pct / deltaPB_pct)
}

export function classifyXED(xed: number): 'substitute' | 'complement' | 'independent' {
  if (xed > 0.05) return 'substitute'
  if (xed < -0.05) return 'complement'
  return 'independent'
}

export function computeYED(deltaQ_pct: number, deltaY_pct: number): number {
  return round(deltaQ_pct / deltaY_pct)
}

export function classifyYED(yed: number): 'luxury' | 'normal' | 'inferior' {
  if (yed > 1) return 'luxury'
  if (yed >= 0) return 'normal'
  return 'inferior'
}

function round(x: number, d = 2): number {
  return Math.round(x * 10 ** d) / 10 ** d
}
