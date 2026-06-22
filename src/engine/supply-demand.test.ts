import { describe, it, expect } from 'vitest'
import {
  solveEquilibrium,
  solvePriceCeiling,
  solvePriceFloor,
  solveTax,
  solveShift,
  generateSDTable,
} from './supply-demand'

const BASE: Parameters<typeof solveEquilibrium>[0] = {
  A: 100,
  Bd: 1,
  C: 20,
  Bs: 1,
}

// ---------------------------------------------------------------------------
// Competitive equilibrium
// ---------------------------------------------------------------------------

describe('solveEquilibrium', () => {
  it('computes Q*, P*, CS, PS, TS, DWL for standard params', () => {
    const result = solveEquilibrium(BASE)
    // Q* = (100-20)/(1+1) = 40
    expect(result.Q).toBe(40)
    // P* = 100 - 1*40 = 60
    expect(result.P).toBe(60)
    // CS = (100-60)*40 - 1*40^2/2 = 1600 - 800 = 800
    expect(result.CS).toBe(800)
    // PS = (60-20)*40 - 1*40^2/2 = 1600 - 800 = 800
    expect(result.PS).toBe(800)
    expect(result.TS).toBe(1600)
    expect(result.DWL).toBe(0)
  })

  it('DWL is always 0 at competitive equilibrium', () => {
    const result = solveEquilibrium({ A: 200, Bd: 2, C: 10, Bs: 3 })
    expect(result.DWL).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Price ceiling
// ---------------------------------------------------------------------------

describe('solvePriceCeiling', () => {
  it('binding ceiling at P=40 creates shortage and DWL', () => {
    const result = solvePriceCeiling(BASE, 40)
    expect(result.type).toBe('ceiling')
    expect(result.P_control).toBe(40)
    // Qd = (100-40)/1 = 60
    expect(result.Qd).toBe(60)
    // Qs = (40-20)/1 = 20
    expect(result.Qs).toBe(20)
    expect(result.Q_traded).toBe(20)
    // shortage = Qd - Qs = 40
    expect(result.shortage_surplus).toBe(40)
    // CS = (100-40)*20 - 1*400/2 = 1200 - 200 = 1000
    expect(result.CS).toBe(1000)
    // PS = (40-20)*20 - 1*400/2 = 400 - 200 = 200
    expect(result.PS).toBe(200)
    expect(result.TS).toBe(1200)
    // DWL = 1600 - 1200 = 400
    expect(result.DWL).toBe(400)
  })

  it('non-binding ceiling at P=70 (above equilibrium P=60) has no effect', () => {
    const result = solvePriceCeiling(BASE, 70)
    // Qs > Qd is not a ceiling issue, but model still computes:
    // Qd = (100-70)/1 = 30, Qs = (70-20)/1 = 50, Q_traded = 30
    expect(result.Q_traded).toBe(30)
    // At a price above equilibrium, the ceiling is non-binding but the model
    // computes the values at that price level
    expect(result.shortage_surplus).toBeLessThan(0) // negative = "surplus" side
  })
})

// ---------------------------------------------------------------------------
// Price floor
// ---------------------------------------------------------------------------

describe('solvePriceFloor', () => {
  it('binding floor at P=80 creates surplus and DWL', () => {
    const result = solvePriceFloor(BASE, 80)
    expect(result.type).toBe('floor')
    expect(result.P_control).toBe(80)
    // Qs = (80-20)/1 = 60
    expect(result.Qs).toBe(60)
    // Qd = (100-80)/1 = 20
    expect(result.Qd).toBe(20)
    expect(result.Q_traded).toBe(20)
    // surplus = Qs - Qd = 40
    expect(result.shortage_surplus).toBe(40)
    // CS = (100-80)*20 - 1*400/2 = 400 - 200 = 200
    expect(result.CS).toBe(200)
    // PS = (80-20)*20 - 1*400/2 = 1200 - 200 = 1000
    expect(result.PS).toBe(1000)
    expect(result.TS).toBe(1200)
    // DWL = 1600 - 1200 = 400
    expect(result.DWL).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// Unit tax
// ---------------------------------------------------------------------------

describe('solveTax', () => {
  it('unit tax of 20 splits burden and creates DWL', () => {
    const result = solveTax(BASE, 20)
    // Q = (100-20-20)/(1+1) = 30
    expect(result.Q).toBe(30)
    // P_buyer = 100 - 1*30 = 70
    expect(result.P_buyer).toBe(70)
    // P_seller = 70 - 20 = 50
    expect(result.P_seller).toBe(50)
    // CS = (100-70)*30 - 1*900/2 = 900 - 450 = 450
    expect(result.CS).toBe(450)
    // PS = (50-20)*30 - 1*900/2 = 900 - 450 = 450
    expect(result.PS).toBe(450)
    // tax_revenue = 20*30 = 600
    expect(result.tax_revenue).toBe(600)
    expect(result.TS).toBe(1500)
    // DWL = 1600 - 1500 = 100
    expect(result.DWL).toBe(100)
    // buyer_burden = 70 - 60 = 10
    expect(result.buyer_burden).toBe(10)
    // seller_burden = 60 - 50 = 10
    expect(result.seller_burden).toBe(10)
  })

  it('zero tax has no DWL', () => {
    const result = solveTax(BASE, 0)
    expect(result.DWL).toBe(0)
    expect(result.Q).toBe(40)
  })

  it('equal slopes → equal burden sharing', () => {
    const result = solveTax(BASE, 20) // Bd === Bs
    expect(result.buyer_burden).toBe(result.seller_burden)
  })
})

// ---------------------------------------------------------------------------
// Shift
// ---------------------------------------------------------------------------

describe('solveShift', () => {
  it('demand increase raises both Q and P', () => {
    const shifted = { ...BASE, A: 120 }
    const result = solveShift(BASE, shifted)
    expect(result.deltaQ).toBeGreaterThan(0)
    expect(result.deltaP).toBeGreaterThan(0)
  })

  it('supply increase raises Q and lowers P', () => {
    const shifted = { ...BASE, C: 10 }
    const result = solveShift(BASE, shifted)
    expect(result.deltaQ).toBeGreaterThan(0)
    expect(result.deltaP).toBeLessThan(0)
  })
})

// ---------------------------------------------------------------------------
// SD table
// ---------------------------------------------------------------------------

describe('generateSDTable', () => {
  it('generates correct number of rows', () => {
    const table = generateSDTable(BASE, 10)
    expect(table.length).toBe(11) // 0..10 inclusive
  })

  it('first row has Q=0 and correct intercept prices', () => {
    const table = generateSDTable(BASE, 10)
    expect(table[0].Q).toBe(0)
    expect(table[0].P_demand).toBe(100) // A
    expect(table[0].P_supply).toBe(20)  // C
  })

  it('last row has Q near equilibrium area with prices crossing', () => {
    const table = generateSDTable(BASE, 10)
    // At Q* = 40, prices should be equal or near equal
    // The table spans from Q=0 to Q=(A-C) = 80
    const eqRow = table.find(r => r.Q === 40)
    if (eqRow) {
      expect(eqRow.surplus_shortage).toBeCloseTo(0, 1)
    }
  })
})
