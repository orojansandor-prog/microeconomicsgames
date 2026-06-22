import { describe, it, expect } from 'vitest'
import {
  COST_SCHEDULE, FC, MIN_MC, Q_MIN_MC, MIN_AVC, Q_MIN_AVC, MIN_ATC, Q_MIN_ATC,
  findOptimalQ, computeProfit, shouldShutDown
} from './costs'

describe('COST_SCHEDULE', () => {
  it('has 11 rows (Q=0..10)', () => {
    expect(COST_SCHEDULE).toHaveLength(11)
  })
  it('Q=0: TC=100, FC=100, VC=0, MC=null', () => {
    const row = COST_SCHEDULE[0]
    expect(row.TC).toBe(100)
    expect(row.FC).toBe(FC)
    expect(row.VC).toBe(0)
    expect(row.MC).toBeNull()
    expect(row.ATC).toBeNull()
  })
  it('Q=5: MC=21 (min MC)', () => {
    expect(COST_SCHEDULE[5].MC).toBe(MIN_MC)
    expect(Q_MIN_MC).toBe(5)
  })
  it('Q=6: AVC=32 (min AVC)', () => {
    expect(COST_SCHEDULE[6].AVC).toBe(MIN_AVC)
    expect(Q_MIN_AVC).toBe(6)
  })
  it('Q=7: ATC=47.3 (min ATC)', () => {
    expect(COST_SCHEDULE[7].ATC).toBe(MIN_ATC)
    expect(Q_MIN_ATC).toBe(7)
  })
  it('Q=8: TC=388', () => {
    expect(COST_SCHEDULE[8].TC).toBe(388)
  })
})

describe('findOptimalQ', () => {
  it('P=60 → Q*=8', () => {
    expect(findOptimalQ(60)).toBe(8)
  })
  it('P=25 (< MIN_AVC=32) → Q*=0 (shut down)', () => {
    expect(findOptimalQ(25)).toBe(0)
  })
  it('P=40 → Q*=7 (MC@7=39<40, MC@8=57>40)', () => {
    expect(findOptimalQ(40)).toBe(7)
  })
})

describe('computeProfit', () => {
  it('Q=8, P=60 → profit=92', () => {
    expect(computeProfit(8, 60)).toBe(92)
  })
  it('Q=0 → profit=-FC=-100', () => {
    expect(computeProfit(0, 60)).toBe(-FC)
  })
})

describe('shouldShutDown', () => {
  it('P=25 → true', () => expect(shouldShutDown(25)).toBe(true))
  it('P=32 → false (exactly at min AVC)', () => expect(shouldShutDown(32)).toBe(false))
  it('P=60 → false', () => expect(shouldShutDown(60)).toBe(false))
})
