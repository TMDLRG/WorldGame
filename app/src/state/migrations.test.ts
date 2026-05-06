import { describe, expect, it } from 'vitest'
import {
  CURRENT_SCHEMA_VERSION,
  PREF_FIELDS,
  defaultPrefs,
  migratePrefs,
  type Prefs,
} from './migrations'

describe('OAS-423-T3 migratePrefs', () => {
  it('returns defaults for null/undefined input', () => {
    const a = migratePrefs(null)
    const b = migratePrefs(undefined)
    expect(a).toEqual(defaultPrefs())
    expect(b).toEqual(defaultPrefs())
    expect(a.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
  })

  it('returns defaults when raw is not an object', () => {
    expect(migratePrefs(42)).toEqual(defaultPrefs())
    expect(migratePrefs('foo')).toEqual(defaultPrefs())
    expect(migratePrefs(true)).toEqual(defaultPrefs())
    expect(migratePrefs([])).toEqual(defaultPrefs())
  })

  it('returns defaults when fields have wrong types', () => {
    const out = migratePrefs({
      schemaVersion: 1,
      locale: 42,
      ageBand: true,
      lastMode: { nested: 'oops' },
    })
    expect(out).toEqual(defaultPrefs())
  })

  it('returns defaults when schemaVersion is unknown (forward-only policy)', () => {
    const out = migratePrefs({
      schemaVersion: 99,
      locale: 'hi',
      ageBand: '6-7',
      lastMode: 'shapeMemory',
    })
    expect(out).toEqual(defaultPrefs())
  })

  it('preserves valid known fields and fills defaults for missing ones (partial)', () => {
    const out = migratePrefs({
      schemaVersion: 1,
      locale: 'es',
    })
    expect(out.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(out.locale).toBe('es')
    expect(out.ageBand).toBeNull()
    expect(out.lastMode).toBeNull()
  })

  it('round-trips a fully valid v1 envelope', () => {
    const out = migratePrefs({
      schemaVersion: 1,
      locale: 'hi',
      ageBand: '8-9',
      lastMode: 'colorShape',
    })
    expect(out).toEqual<Prefs>({
      schemaVersion: 1,
      locale: 'hi',
      ageBand: '8-9',
      lastMode: 'colorShape',
    })
  })

  it('rejects unsupported locale/ageBand/mode values and falls back to defaults for those slots', () => {
    const out = migratePrefs({
      schemaVersion: 1,
      locale: 'fr',
      ageBand: '99-100',
      lastMode: 'flying-fish',
    })
    expect(out.locale).toBe('en')
    expect(out.ageBand).toBeNull()
    expect(out.lastMode).toBeNull()
  })

  it('PII allow-list: schema only contains schemaVersion, locale, ageBand, lastMode', () => {
    expect(PREF_FIELDS).toEqual([
      'schemaVersion',
      'locale',
      'ageBand',
      'lastMode',
    ])
    const out = migratePrefs({
      schemaVersion: 1,
      locale: 'en',
      ageBand: '4-5',
      lastMode: 'math',
      // attempted PII smuggling \u2014 must NOT survive migration
      email: 'kid@example.com',
      name: 'Sample',
      ip: '1.2.3.4',
    } as unknown)
    expect(Object.keys(out).sort()).toEqual(
      ['ageBand', 'lastMode', 'locale', 'schemaVersion'].sort(),
    )
    const bag = out as unknown as Record<string, unknown>
    expect(bag.email).toBeUndefined()
    expect(bag.name).toBeUndefined()
    expect(bag.ip).toBeUndefined()
  })

  it('CURRENT_SCHEMA_VERSION is a positive integer', () => {
    expect(Number.isInteger(CURRENT_SCHEMA_VERSION)).toBe(true)
    expect(CURRENT_SCHEMA_VERSION).toBeGreaterThanOrEqual(1)
  })
})
