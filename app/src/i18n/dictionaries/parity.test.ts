import { describe, expect, it } from 'vitest'
import { en } from './en'
import { hi } from './hi'
import { es } from './es'

const enKeys = Object.keys(en).sort()

describe('OAS-422-T3 dictionary parity', () => {
  it('hi has every en key', () => {
    const hiKeys = Object.keys(hi).sort()
    const missing = enKeys.filter((k) => !hiKeys.includes(k))
    expect(missing, `hi missing keys: ${missing.join(', ')}`).toEqual([])
  })

  it('es has every en key', () => {
    const esKeys = Object.keys(es).sort()
    const missing = enKeys.filter((k) => !esKeys.includes(k))
    expect(missing, `es missing keys: ${missing.join(', ')}`).toEqual([])
  })

  it('hi/es do not introduce keys absent from en', () => {
    const hiExtra = Object.keys(hi).filter((k) => !enKeys.includes(k))
    const esExtra = Object.keys(es).filter((k) => !enKeys.includes(k))
    expect(hiExtra).toEqual([])
    expect(esExtra).toEqual([])
  })

  it('all hi/es values are non-empty strings', () => {
    for (const [k, v] of Object.entries(hi)) {
      expect(typeof v, `hi.${k}`).toBe('string')
      expect((v as string).length, `hi.${k}`).toBeGreaterThan(0)
    }
    for (const [k, v] of Object.entries(es)) {
      expect(typeof v, `es.${k}`).toBe('string')
      expect((v as string).length, `es.${k}`).toBeGreaterThan(0)
    }
  })
})
