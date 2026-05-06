import { fireEvent, render, screen } from '@testing-library/react'
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

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage())
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

  it('renders the Shape Memory placeholder at "/play/shape-memory"', () => {
    render(
      <MemoryRouter initialEntries={["/play/shape-memory"]}>
        <AppRouter />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Shape Memory' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back home' })).toBeInTheDocument()
  })

  it('renders the Color & Shape placeholder at "/play/color-shape"', () => {
    render(
      <MemoryRouter initialEntries={["/play/color-shape"]}>
        <AppRouter />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Color & Shape' })).toBeInTheDocument()
  })

  it('renders the Math Match placeholder at "/play/math-match"', () => {
    render(
      <MemoryRouter initialEntries={["/play/math-match"]}>
        <AppRouter />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Math Match' })).toBeInTheDocument()
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
  })

  it('Back home button on a placeholder returns to HomePage', () => {
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
