import { describe, it, expect } from 'vitest'
import {
  solveMonopoly, solvePriceCap,
  generateTable, inverseP, marginalRevenue, demandQ,
} from './monopoly'

// Alap teszteset: P = 100 - 2Q, MC = 20
const BASE = { A: 100, B: 2, MC: 20 }

describe('solveMonopoly', () => {
  it('Q* = (A-MC)/(2B) = 20', () => {
    const r = solveMonopoly(BASE)
    expect(r.Q_monopoly).toBe(20)
  })
  it('P* = A - B*Q* = 60', () => {
    expect(solveMonopoly(BASE).P_monopoly).toBe(60)
  })
  it('profit = (P-MC)*Q = 800', () => {
    expect(solveMonopoly(BASE).profit_monopoly).toBe(800)
  })
  it('CS = 0.5*(A-P)*Q = 400', () => {
    expect(solveMonopoly(BASE).CS_monopoly).toBe(400)
  })
  it('DWL = 0.5*(P-MC)*(Qc-Qm) = 400', () => {
    expect(solveMonopoly(BASE).DWL).toBe(400)
  })
  it('versenypiaci Q_c = 40', () => {
    expect(solveMonopoly(BASE).Q_competitive).toBe(40)
  })
})

describe('solvePriceCap', () => {
  it('árplafon MC-n → DWL=0, hatékony', () => {
    const r = solvePriceCap(BASE, 20)
    expect(r.DWL_capped).toBe(0)
    expect(r.isEfficient).toBe(true)
  })
  it('árplafon P* felett → nincs hatás', () => {
    const r = solvePriceCap(BASE, 70)
    const base = solveMonopoly(BASE)
    expect(r.Q_cap).toBe(base.Q_monopoly)
  })
  it('árplafon 40-en → Q=30, CS nő', () => {
    const r = solvePriceCap(BASE, 40)
    expect(r.Q_cap).toBe(30)
    expect(r.CS_capped).toBeGreaterThan(solveMonopoly(BASE).CS_monopoly)
  })
})

describe('generateTable', () => {
  it('10 lépés → 11 sor', () => {
    expect(generateTable(BASE, 10).length).toBe(11)
  })
  it('első sor: Q=0, P=A', () => {
    const row = generateTable(BASE, 10)[0]
    expect(row.Q).toBe(0)
    expect(row.P).toBe(BASE.A)
  })
})

describe('segédfüggvények', () => {
  it('inverseP(100,2,20) = 60', () => expect(inverseP(100, 2, 20)).toBe(60))
  it('MR(100,2,20) = 20', () => expect(marginalRevenue(100, 2, 20)).toBe(20))
  it('demandQ(100,2,60) = 20', () => expect(demandQ(100, 2, 60)).toBe(20))
})
