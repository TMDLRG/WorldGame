import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getItem, removeItem, safeReadAll, setItem, STORAGE_KEYS } from './storage'

function createMemoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    removeItem: (k: string) => {
      map.delete(k)
    },
    setItem: (k: string, v: string) => {
      map.set(k, String(v))
    },
  }
}

let realStorage: Storage

beforeEach(() => {
  realStorage = createMemoryStorage()
  vi.stubGlobal('localStorage', realStorage)
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('OAS-423-T1 storage adapter', () => {
  it('round-trips a value via setItem/getItem', () => {
    setItem('xswu.locale', 'es')
    expect(getItem('xswu.locale', 'en')).toBe('es')
  })

  it('returns the default when key is absent', () => {
    expect(getItem('xswu.lastMode', 'shapeMemory')).toBe('shapeMemory')
  })

  it('removeItem deletes the key', () => {
    setItem('xswu.ageBand', '4-5')
    removeItem('xswu.ageBand')
    expect(getItem('xswu.ageBand', '6-7')).toBe('6-7')
  })

  it('does not throw when localStorage.getItem throws (private mode)', () => {
    const broken = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('SecurityError')
      },
      removeItem: () => {
        throw new Error('SecurityError')
      },
      clear: () => {},
      key: () => null,
      length: 0,
    } as unknown as Storage
    vi.stubGlobal('localStorage', broken)
    expect(() => setItem('xswu.locale', 'es')).not.toThrow()
    expect(getItem('xswu.locale', 'en')).toBe('en')
    expect(() => removeItem('xswu.locale')).not.toThrow()
  })

  it('returns default when stored JSON is corrupt and clears the bad entry', () => {
    realStorage.setItem('xswu.locale', '{not valid json')
    expect(getItem('xswu.locale', 'en')).toBe('en')
    expect(realStorage.getItem('xswu.locale')).toBeNull()
  })

  it('safeReadAll returns three known preferences with defaults', () => {
    const all = safeReadAll()
    expect(Object.keys(all).sort()).toEqual(['ageBand', 'lastMode', 'locale'])
  })

  it('exposes only xswu.* namespaced keys', () => {
    expect(STORAGE_KEYS.locale).toBe('xswu.locale')
    expect(STORAGE_KEYS.ageBand).toBe('xswu.ageBand')
    expect(STORAGE_KEYS.lastMode).toBe('xswu.lastMode')
    for (const k of Object.values(STORAGE_KEYS)) {
      expect(k.startsWith('xswu.')).toBe(true)
    }
  })

  it('SSR safety: returns default when localStorage is undefined', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(getItem('xswu.locale', 'en')).toBe('en')
    expect(() => setItem('xswu.locale', 'hi')).not.toThrow()
  })
})
