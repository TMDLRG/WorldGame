import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useReducedMotion } from './useReducedMotion'

const here = dirname(fileURLToPath(import.meta.url))
const layoutCss = readFileSync(resolve(here, '../styles/layout.css'), 'utf8')

interface FakeMediaQueryList {
  matches: boolean
  media: string
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown) | null
  addEventListener: ReturnType<typeof vi.fn>
  removeEventListener: ReturnType<typeof vi.fn>
  addListener: ReturnType<typeof vi.fn>
  removeListener: ReturnType<typeof vi.fn>
  dispatchEvent: ReturnType<typeof vi.fn>
  _trigger: (matches: boolean) => void
}

function makeMediaQueryList(initial: boolean): FakeMediaQueryList {
  let listeners: Array<(ev: MediaQueryListEvent) => unknown> = []
  const mql: FakeMediaQueryList = {
    matches: initial,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn((event: string, cb: (ev: MediaQueryListEvent) => unknown) => {
      if (event === 'change') listeners.push(cb)
    }),
    removeEventListener: vi.fn((event: string, cb: (ev: MediaQueryListEvent) => unknown) => {
      if (event === 'change') listeners = listeners.filter((l) => l !== cb)
    }),
    addListener: vi.fn((cb: (ev: MediaQueryListEvent) => unknown) => listeners.push(cb)),
    removeListener: vi.fn((cb: (ev: MediaQueryListEvent) => unknown) => {
      listeners = listeners.filter((l) => l !== cb)
    }),
    dispatchEvent: vi.fn(),
    _trigger(matches: boolean) {
      this.matches = matches
      const ev = { matches, media: this.media } as unknown as MediaQueryListEvent
      for (const l of listeners) l(ev)
      this.onchange?.call(this as unknown as MediaQueryList, ev)
    },
  }
  return mql
}

let lastMql: FakeMediaQueryList | null = null

function installMatchMedia(initial: boolean) {
  const mql = makeMediaQueryList(initial)
  lastMql = mql
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => {
      mql.media = query
      return mql as unknown as MediaQueryList
    }),
  )
  Object.defineProperty(window, 'matchMedia', {
    value: window.matchMedia ?? globalThis.matchMedia,
    configurable: true,
    writable: true,
  })
  window.matchMedia = globalThis.matchMedia
}

beforeEach(() => {
  lastMql = null
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('OAS-428-T2 useReducedMotion()', () => {
  it('returns false when matchMedia reports prefers-reduced-motion: no-preference', () => {
    installMatchMedia(false)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('returns true when matchMedia reports prefers-reduced-motion: reduce at mount', () => {
    installMatchMedia(true)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('subscribes to the (prefers-reduced-motion: reduce) media query exactly once', () => {
    installMatchMedia(false)
    renderHook(() => useReducedMotion())
    expect(lastMql).not.toBeNull()
    const usedAddEvent = lastMql!.addEventListener.mock.calls.length > 0
    const usedAddListener = lastMql!.addListener.mock.calls.length > 0
    expect(usedAddEvent || usedAddListener).toBe(true)
  })

  it('updates re-renders when the media query change event fires (runtime toggle)', () => {
    installMatchMedia(false)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
    act(() => {
      lastMql!._trigger(true)
    })
    expect(result.current).toBe(true)
    act(() => {
      lastMql!._trigger(false)
    })
    expect(result.current).toBe(false)
  })

  it('removes its listener on unmount (no leak)', () => {
    installMatchMedia(false)
    const { unmount } = renderHook(() => useReducedMotion())
    unmount()
    const removed =
      lastMql!.removeEventListener.mock.calls.length +
      lastMql!.removeListener.mock.calls.length
    expect(removed).toBeGreaterThan(0)
  })

  it('returns false in environments without matchMedia (SSR / unsupported)', () => {
    vi.stubGlobal('matchMedia', undefined)
    Object.defineProperty(window, 'matchMedia', {
      value: undefined,
      configurable: true,
      writable: true,
    })
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })
})

describe('OAS-428-T2 layout.css honors prefers-reduced-motion globally', () => {
  it('declares a (prefers-reduced-motion: reduce) media query', () => {
    expect(layoutCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/)
  })

  it('disables animation and transition globally inside the gate', () => {
    const block = layoutCss.match(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\}\s*\}/,
    )
    expect(block).not.toBeNull()
    const text = block![0]
    expect(text).toMatch(/animation:\s*none/)
    expect(text).toMatch(/transition:\s*none/)
    expect(text).toMatch(/\*\s*,/)
  })
})
