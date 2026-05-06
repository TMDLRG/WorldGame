import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { AgeBandSelector } from './AgeBandSelector'

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

let mem: Storage

beforeEach(() => {
  mem = memoryStorage()
  vi.stubGlobal('localStorage', mem)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function Harness() {
  return (
    <LocaleProvider initialLocale="en">
      <AgeBandSelector />
    </LocaleProvider>
  )
}

describe('OAS-421-T2 AgeBandSelector', () => {
  it('renders three buttons (4 to 5, 6 to 7, 8 to 9) inside a radiogroup labelled Age', () => {
    render(<Harness />)
    expect(screen.getByRole('radiogroup', { name: 'Age' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4 to 5' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '6 to 7' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '8 to 9' })).toBeInTheDocument()
  })

  it('starts with no selection (preferences null) so all aria-pressed=false', () => {
    render(<Harness />)
    for (const name of ['4 to 5', '6 to 7', '8 to 9']) {
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'false')
    }
  })

  it('persists selection to xswu.ageBand and reflects aria-pressed on selected button', () => {
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: '6 to 7' }))
    expect(JSON.parse(mem.getItem('xswu.ageBand')!)).toBe('6-7')
    expect(screen.getByRole('button', { name: '6 to 7' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '4 to 5' })).toHaveAttribute('aria-pressed', 'false')
  })
})
