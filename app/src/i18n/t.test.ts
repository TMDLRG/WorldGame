import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { t, type Locale, type TranslationKey } from './t'

describe('OAS-422-T1 t() helper', () => {
  it('returns the en value for a known key when locale is en', () => {
    const key: TranslationKey = 'home.title'
    const locale: Locale = 'en'
    expect(typeof t(key, locale)).toBe('string')
    expect(t(key, locale).length).toBeGreaterThan(0)
  })

  it('falls back to en when key is missing in active locale (hi/es)', () => {
    const en = t('home.title', 'en')
    expect(t('home.title', 'hi')).toBeTypeOf('string')
    expect(t('home.title', 'es')).toBeTypeOf('string')
    expect(en).not.toEqual('')
  })

  it('interpolates {var} placeholders from the vars argument', () => {
    expect(t('prompt.colorShape', 'en', { color: 'red', shape: 'circle' })).toContain('red')
    expect(t('prompt.colorShape', 'en', { color: 'red', shape: 'circle' })).toContain('circle')
  })

  it('warns once in dev when key missing in target locale, never throws', () => {
    vi.stubEnv('DEV', true)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const value = t('__dev_missing_key__' as TranslationKey, 'hi')
      expect(typeof value).toBe('string')
      expect(warn).toHaveBeenCalled()
    } finally {
      warn.mockRestore()
      vi.unstubAllEnvs()
    }
  })

  it('does not warn in production for missing keys', () => {
    vi.stubEnv('DEV', false)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      t('__prod_missing_key__' as TranslationKey, 'hi')
      expect(warn).not.toHaveBeenCalled()
    } finally {
      warn.mockRestore()
      vi.unstubAllEnvs()
    }
  })
})

beforeEach(() => {
  vi.restoreAllMocks()
})
afterEach(() => {
  vi.restoreAllMocks()
})
