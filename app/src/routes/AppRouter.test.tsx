import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AppRouter } from './AppRouter'

function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() { return map.size },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    removeItem: (k: string) => { map.delete(k) },
    setItem: (k: string, v: string) => { map.set(k, String(v)) },
  }
}

function mockMatchMedia(reducedMotion = false): void {
  const impl = (q: string): MediaQueryList =>
    ({
      matches:
        reducedMotion && q.includes('prefers-reduced-motion: reduce')
          ? true
          : false,
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
  vi.stubGlobal('matchMedia', impl)
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: impl,
  })
}

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage())
  mockMatchMedia(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('OAS-421-T3 AppRouter', () => {
  it('renders HomePage at "/"', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRouter />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'XSWU' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Language' })).toBeInTheDocument()
  })

  it('renders the Shape Memory board at "/play/shape-memory"', () => {
    render(
      <MemoryRouter initialEntries={["/play/shape-memory"]}>
        <AppRouter />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Shape Memory' })).toBeInTheDocument()
    const grid = screen.getByTestId('shape-memory-grid')
    expect(within(grid).getAllByRole('button').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Back home' })).toBeInTheDocument()
  })

  it('renders the Color & Shape board at "/play/color-shape"', () => {
    render(
      <MemoryRouter initialEntries={["/play/color-shape"]}>
        <AppRouter />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Color & Shape' })).toBeInTheDocument()
    expect(screen.getByTestId('prompt')).toBeInTheDocument()
    const choices = screen.getByTestId('cs-choices')
    expect(within(choices).getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('renders the Math Match board at "/play/math-match"', () => {
    render(
      <MemoryRouter initialEntries={["/play/math-match"]}>
        <AppRouter />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Math Match' })).toBeInTheDocument()
    expect(screen.getByTestId('prompt')).toBeInTheDocument()
    const choices = screen.getByTestId('math-choices')
    expect(within(choices).getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('clicking the Shape Memory button on home navigates to /play/shape-memory (single click from home)', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRouter />
      </MemoryRouter>,
    )
    const button = screen.getByRole('button', { name: 'Shape Memory' })
    fireEvent.click(button)
    expect(screen.getByRole('heading', { level: 1, name: 'Shape Memory' })).toBeInTheDocument()
    expect(screen.getByTestId('shape-memory-grid')).toBeInTheDocument()
  })

  it('Back home button on a play route returns to HomePage', () => {
    render(
      <MemoryRouter initialEntries={["/play/math-match"]}>
        <AppRouter />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Back home' }))
    expect(screen.getByRole('heading', { level: 1, name: 'XSWU' })).toBeInTheDocument()
  })

  it('renders a 404 fallback for unknown routes with a link back home', () => {
    render(
      <MemoryRouter initialEntries={["/does/not/exist"]}>
        <AppRouter />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: 'Back home' })).toBeInTheDocument()
  })
})
