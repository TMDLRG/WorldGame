import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePreferences } from './usePreferences'
import { STORAGE_KEYS } from './storage'

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

let mem: Storage

beforeEach(() => {
  mem = createMemoryStorage()
  vi.stubGlobal('localStorage', mem)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function Probe({
  onState,
}: {
  onState: (api: ReturnType<typeof usePreferences>) => void
}) {
  const api = usePreferences()
  onState(api)
  return null
}

describe('OAS-423-T2 usePreferences', () => {
  it('reads defaults when storage is empty', () => {
    let api: ReturnType<typeof usePreferences> | null = null
    render(<Probe onState={(a) => (api = a)} />)
    expect(api).not.toBeNull()
    expect(api!.locale).toBe('en')
    expect(api!.ageBand).toBeNull()
    expect(api!.lastMode).toBeNull()
  })

  it('hydrates from localStorage on mount', () => {
    mem.setItem(STORAGE_KEYS.locale, JSON.stringify('hi'))
    mem.setItem(STORAGE_KEYS.ageBand, JSON.stringify('6-7'))
    mem.setItem(STORAGE_KEYS.lastMode, JSON.stringify('shapeMemory'))
    let api: ReturnType<typeof usePreferences> | null = null
    render(<Probe onState={(a) => (api = a)} />)
    expect(api!.locale).toBe('hi')
    expect(api!.ageBand).toBe('6-7')
    expect(api!.lastMode).toBe('shapeMemory')
  })

  it('persists locale changes through setLocale', () => {
    let api: ReturnType<typeof usePreferences> | null = null
    render(<Probe onState={(a) => (api = a)} />)
    act(() => {
      api!.setLocale('es')
    })
    expect(JSON.parse(mem.getItem(STORAGE_KEYS.locale)!)).toBe('es')
  })

  it('persists ageBand and lastMode changes', () => {
    let api: ReturnType<typeof usePreferences> | null = null
    render(<Probe onState={(a) => (api = a)} />)
    act(() => {
      api!.setAgeBand('8-9')
      api!.setLastMode('colorShape')
    })
    expect(JSON.parse(mem.getItem(STORAGE_KEYS.ageBand)!)).toBe('8-9')
    expect(JSON.parse(mem.getItem(STORAGE_KEYS.lastMode)!)).toBe('colorShape')
  })

  it('rejects unsupported locale and falls back to en', () => {
    let api: ReturnType<typeof usePreferences> | null = null
    render(<Probe onState={(a) => (api = a)} />)
    act(() => {
      api!.setLocale('fr' as never)
    })
    expect(api!.locale).toBe('en')
  })
})
