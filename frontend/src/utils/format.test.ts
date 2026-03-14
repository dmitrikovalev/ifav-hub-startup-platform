import { describe, it, expect } from 'vitest'
import { fmt } from './format'

describe('fmt', () => {
  it('returns "—" for null', () => {
    expect(fmt(null)).toBe('—')
  })

  it('returns "—" for undefined', () => {
    expect(fmt(undefined)).toBe('—')
  })

  it('returns "$0" for zero', () => {
    expect(fmt(0)).toBe('$0')
  })

  it('formats small numbers as dollars', () => {
    expect(fmt(500)).toBe('$500')
  })

  it('formats thousands with K suffix', () => {
    expect(fmt(5_000)).toBe('$5K')
    expect(fmt(50_000)).toBe('$50K')
    expect(fmt(999_000)).toBe('$999K')
  })

  it('formats millions with M suffix', () => {
    expect(fmt(1_000_000)).toBe('$1.0M')
    expect(fmt(2_500_000)).toBe('$2.5M')
    expect(fmt(10_000_000)).toBe('$10.0M')
  })

  it('handles edge case: exactly 1000', () => {
    expect(fmt(1_000)).toBe('$1K')
  })

  it('handles negative numbers as dollars', () => {
    expect(fmt(-500)).toBe('$-500')
  })
})
