import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { en } from './en'
import { es } from './es'
import { hi } from './hi'
import { DICTIONARIES_VERSION, EXPECTED_KEY_COUNT } from './index'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..', '..')

describe('OAS-429-T3 dictionaries v1.0.0 lock', () => {
  it('exports a frozen DICTIONARIES_VERSION === 1.0.0 from src/i18n/dictionaries/index.ts', () => {
    expect(DICTIONARIES_VERSION).toBe('1.0.0')
  })

  it('exports an EXPECTED_KEY_COUNT that matches en, hi, and es', () => {
    expect(Object.keys(en)).toHaveLength(EXPECTED_KEY_COUNT)
    expect(Object.keys(hi)).toHaveLength(EXPECTED_KEY_COUNT)
    expect(Object.keys(es)).toHaveLength(EXPECTED_KEY_COUNT)
  })

  it('en, hi, and es expose an identical key set (full parity)', () => {
    const enKeys = Object.keys(en).sort()
    const hiKeys = Object.keys(hi).sort()
    const esKeys = Object.keys(es).sort()
    expect(hiKeys).toEqual(enKeys)
    expect(esKeys).toEqual(enKeys)
  })

  it('every value in hi and es is a non-empty string (no missing translations)', () => {
    for (const key of Object.keys(en) as Array<keyof typeof en>) {
      const hiValue = (hi as Record<string, string | undefined>)[key]
      const esValue = (es as Record<string, string | undefined>)[key]
      expect(hiValue, `hi missing ${key}`).toBeTypeOf('string')
      expect(esValue, `es missing ${key}`).toBeTypeOf('string')
      expect((hiValue ?? '').length, `hi empty ${key}`).toBeGreaterThan(0)
      expect((esValue ?? '').length, `es empty ${key}`).toBeGreaterThan(0)
    }
  })

  it('app/CHANGELOG.md exists and records the v1.0.0 i18n dictionary lock', () => {
    const changelog = resolve(repoRoot, 'CHANGELOG.md')
    expect(existsSync(changelog)).toBe(true)
    const text = readFileSync(changelog, 'utf8')
    expect(text).toMatch(/1\.0\.0/)
    expect(text).toMatch(/OAS-429/)
    expect(text).toMatch(/i18n/i)
  })

  it('src/i18n/dictionaries/README.md documents the lock policy', () => {
    const readme = resolve(here, 'README.md')
    expect(existsSync(readme)).toBe(true)
    const text = readFileSync(readme, 'utf8')
    expect(text).toMatch(/1\.0\.0/)
    expect(text).toMatch(/lock/i)
    expect(text).toMatch(/parity/i)
  })
})
