import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { LanguageSelector } from './LanguageSelector'

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
      <LanguageSelector />
    </LocaleProvider>
  )
}

describe('OAS-421-T2 LanguageSelector', () => {
  it('renders three buttons (English, Hindi, Spanish) inside a radiogroup', () => {
    render(<Harness />)
    const group = screen.getByRole('radiogroup', { name: 'Language' })
    expect(group).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hindi' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Spanish' })).toBeInTheDocument()
  })

  it('marks the current locale with aria-pressed=true and others false', () => {
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Hindi' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Spanish' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches global locale and persists to xswu.locale on click', () => {
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: 'Hindi' }))
    expect(JSON.parse(mem.getItem('xswu.locale')!)).toBe('hi')
    expect(screen.getByRole('button', { name: '\u0939\u093f\u0928\u094d\u0926\u0940' })).toHaveAttribute('aria-pressed', 'true')
  })
})
