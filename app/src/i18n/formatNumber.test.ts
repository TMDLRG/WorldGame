import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatNumber, __resetFormatNumberWarningForTests } from './formatNumber'

beforeEach(() => {
  __resetFormatNumberWarningForTests()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('OAS-426-T3 formatNumber', () => {
  it('returns Western digits for en', () => {
    expect(formatNumber(3, 'en')).toBe('3')
    expect(formatNumber(20, 'en')).toBe('20')
  })

  it('returns Devanagari digits for hi by default', () => {
    expect(formatNumber(3, 'hi')).toBe('३')
    expect(formatNumber(20, 'hi')).toBe('२०')
  })

  it('returns Western digits for es', () => {
    expect(formatNumber(3, 'es')).toBe('3')
    expect(formatNumber(15, 'es')).toBe('15')
  })

  it('opts.numerals="western" overrides hi default', () => {
    expect(formatNumber(3, 'hi', { numerals: 'western' })).toBe('3')
  })

  it('opts.numerals="devanagari" overrides en default', () => {
    expect(formatNumber(3, 'en', { numerals: 'devanagari' })).toBe('३')
  })

  it('handles negatives with `-` prefix in both systems', () => {
    expect(formatNumber(-5, 'en')).toBe('-5')
    expect(formatNumber(-5, 'hi')).toBe('-५')
  })

  it('zero formats to single zero', () => {
    expect(formatNumber(0, 'en')).toBe('0')
    expect(formatNumber(0, 'hi')).toBe('०')
  })

  it('range 0..20 formats correctly in en (Western)', () => {
    for (let i = 0; i <= 20; i++) {
      expect(formatNumber(i, 'en')).toBe(String(i))
    }
  })

  it('range 0..20 formats correctly in hi (Devanagari)', () => {
    const D = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
    for (let i = 0; i <= 20; i++) {
      const expected = String(i)
        .split('')
        .map((d) => D[Number(d)])
        .join('')
      expect(formatNumber(i, 'hi')).toBe(expected)
    }
  })

  it('non-integer input rounds and warns once in dev', () => {
    vi.stubEnv('DEV', true)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      expect(formatNumber(3.7, 'en')).toBe('4')
      expect(warn).toHaveBeenCalledTimes(1)
      // Second non-integer should not trigger another warn (one-time guard)
      expect(formatNumber(2.4, 'en')).toBe('2')
      expect(warn).toHaveBeenCalledTimes(1)
    } finally {
      warn.mockRestore()
    }
  })

  it('renders large numbers digit-by-digit', () => {
    expect(formatNumber(1234, 'hi')).toBe('१२३४')
    expect(formatNumber(1234, 'en')).toBe('1234')
  })
})
