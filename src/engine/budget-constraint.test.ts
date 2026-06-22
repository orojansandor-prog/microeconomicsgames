import { describe, it, expect } from 'vitest'
import {
  BASE_PARAMS,
  LEVEL2_BASKETS,
  budgetY,
  xIntercept,
  yIntercept,
  budgetSlope,
  spending,
  utilityAt,
  mrsAt,
  solveOptimum,
  icPoints,
  solveSlutskyDecomposition,
  generateBCTable,
} from './budget-constraint'

const p = BASE_PARAMS // I=4800, Px=300, Py=400, alpha=0.5

describe('Budget constraint', () => {
  it('xIntercept = I/Px', () => {
    expect(xIntercept(p)).toBe(16) // 4800/300
  })
  it('yIntercept = I/Py', () => {
    expect(yIntercept(p)).toBe(12) // 4800/400
  })
  it('slope = -Px/Py', () => {
    expect(budgetSlope(p)).toBe(-0.75) // -300/400
  })
  it('budgetY at X=0 = yIntercept', () => {
    expect(budgetY(p, 0)).toBe(12)
  })
  it('budgetY at X=xIntercept = 0', () => {
    expect(budgetY(p, 16)).toBe(0)
  })
  it('spending on budget line = I', () => {
    const X = 8, Y = budgetY(p, X)
    expect(spending(p, X, Y)).toBeCloseTo(4800, 0)
  })
})

describe('Utility and MRS', () => {
  it('utilityAt(8, 6) ≈ sqrt(48)', () => {
    expect(utilityAt(p, 8, 6)).toBeCloseTo(Math.sqrt(48), 1)
  })
  it('utilityAt(0, 6) = 0', () => {
    expect(utilityAt(p, 0, 6)).toBe(0)
  })
  it('MRS at (8, 6) = Y/X = 0.75 = Px/Py', () => {
    // alpha=0.5 → MRS = (0.5/0.5)*(Y/X) = Y/X = 6/8 = 0.75
    expect(mrsAt(p, 8, 6)).toBe(0.75)
  })
  it('MRS at optimum = Px/Py', () => {
    const opt = solveOptimum(p)
    expect(mrsAt(p, opt.X_star, opt.Y_star)).toBeCloseTo(p.Px / p.Py, 2)
  })
})

describe('Consumer optimum (Cobb-Douglas, alpha=0.5)', () => {
  it('X* = I/(2*Px) = 8', () => {
    const opt = solveOptimum(p)
    expect(opt.X_star).toBe(8) // 4800/(2*300)
  })
  it('Y* = I/(2*Py) = 6', () => {
    const opt = solveOptimum(p)
    expect(opt.Y_star).toBe(6) // 4800/(2*400)
  })
  it('Px*X* + Py*Y* = I (budget exhausted)', () => {
    const opt = solveOptimum(p)
    expect(p.Px * opt.X_star + p.Py * opt.Y_star).toBeCloseTo(p.I, 0)
  })
  it('MRS* = Px/Py at optimum', () => {
    const opt = solveOptimum(p)
    expect(opt.MRS_star).toBeCloseTo(p.Px / p.Py, 2)
  })
  it('U_star > utility at any other on-budget point', () => {
    const opt = solveOptimum(p)
    const U_star = opt.U_star
    // Test a non-optimal point: X=4, Y=9
    const U_alt = utilityAt(p, 4, budgetY(p, 4))
    expect(U_star).toBeGreaterThan(U_alt)
  })
})

describe('IC curves', () => {
  it('all points on IC satisfy U ≈ target', () => {
    const opt = solveOptimum(p)
    const pts = icPoints(p, opt.U_star, 20)
    for (const pt of pts) {
      expect(utilityAt(p, pt.X, pt.Y)).toBeCloseTo(opt.U_star, 1)
    }
  })
  it('returns points', () => {
    const pts = icPoints(p, 5, 20)
    expect(pts.length).toBeGreaterThan(5)
  })
})

describe('Level 2 baskets', () => {
  it('A and B have equal utility (trap)', () => {
    const uA = utilityAt(p, LEVEL2_BASKETS[0].X, LEVEL2_BASKETS[0].Y)
    const uB = utilityAt(p, LEVEL2_BASKETS[1].X, LEVEL2_BASKETS[1].Y)
    expect(uA).toBeCloseTo(uB, 1) // both ≈ 6
  })
  it('C has higher utility than A and B', () => {
    const uA = utilityAt(p, LEVEL2_BASKETS[0].X, LEVEL2_BASKETS[0].Y)
    const uC = utilityAt(p, LEVEL2_BASKETS[2].X, LEVEL2_BASKETS[2].Y)
    expect(uC).toBeGreaterThan(uA)
  })
  it('D has lower utility than A', () => {
    const uA = utilityAt(p, LEVEL2_BASKETS[0].X, LEVEL2_BASKETS[0].Y)
    const uD = utilityAt(p, LEVEL2_BASKETS[3].X, LEVEL2_BASKETS[3].Y)
    expect(uD).toBeLessThan(uA)
  })
  it('B has more total goods than A but same utility', () => {
    const A = LEVEL2_BASKETS[0], B = LEVEL2_BASKETS[1]
    expect(B.X + B.Y).toBeGreaterThan(A.X + A.Y)
    const uA = utilityAt(p, A.X, A.Y)
    const uB = utilityAt(p, B.X, B.Y)
    expect(uA).toBeCloseTo(uB, 1)
  })
})

describe('Slutsky decomposition', () => {
  it('total effect = substitution + income', () => {
    const r = solveSlutskyDecomposition(p, 600) // Px doubles: 300→600
    expect(r.total_effect).toBeCloseTo(r.substitution_effect + r.income_effect, 1)
  })
  it('price increase → fewer X bought (normal good)', () => {
    const r = solveSlutskyDecomposition(p, 600)
    expect(r.X_new).toBeLessThan(r.X_orig)
    expect(r.total_effect).toBeLessThan(0)
  })
  it('substitution effect is negative (higher Px → less X)', () => {
    const r = solveSlutskyDecomposition(p, 600)
    expect(r.substitution_effect).toBeLessThan(0)
  })
  it('income effect is negative for normal good', () => {
    const r = solveSlutskyDecomposition(p, 600)
    expect(r.income_effect).toBeLessThan(0)
  })
  it('I_slutsky > I when Px increases', () => {
    const r = solveSlutskyDecomposition(p, 600)
    expect(r.I_slutsky).toBeGreaterThan(p.I)
  })
  it('X_slutsky between X_orig and X_new', () => {
    const r = solveSlutskyDecomposition(p, 600)
    expect(r.X_slutsky).toBeLessThan(r.X_orig)
    expect(r.X_slutsky).toBeGreaterThan(r.X_new)
  })
})

describe('BC table', () => {
  it('all rows on budget line', () => {
    const rows = generateBCTable(p)
    for (const row of rows) {
      expect(spending(p, row.X, row.Y)).toBeCloseTo(p.I, 0)
    }
  })
  it('exactly one optimal row', () => {
    const rows = generateBCTable(p)
    expect(rows.filter(r => r.isOptimal).length).toBe(1)
  })
  it('optimal row has max utility', () => {
    const rows = generateBCTable(p)
    const maxU = Math.max(...rows.map(r => r.U))
    const optRow = rows.find(r => r.isOptimal)!
    expect(optRow.U).toBeCloseTo(maxU, 1)
  })
})
