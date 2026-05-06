import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

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
  window.history.replaceState({}, '', '/')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('OAS-420-T1 scaffold + OAS-421-T3 router mount', () => {
  it('renders XSWU title at the root route', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: /xswu/i })).toBeInTheDocument()
  })

  it('renders the trust banner copy on the home route', () => {
    render(<App />)
    expect(
      screen.getByText('No ads. No accounts. No tracking.'),
    ).toBeInTheDocument()
  })
})
