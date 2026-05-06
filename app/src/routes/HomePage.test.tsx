import { useEffect } from 'react'
import { act, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { useLocale } from '../i18n/useLocale'
import { HomePage } from './HomePage'

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

beforeEach(() => {
  vi.stubGlobal('localStorage', createMemoryStorage())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

interface ProbeRef {
  setLocale: (l: 'en' | 'hi' | 'es') => void
}

function LocaleProbe({ probeRef }: { probeRef: { current: ProbeRef | null } }) {
  const { setLocale } = useLocale()
  useEffect(() => {
    probeRef.current = { setLocale }
    return () => {
      probeRef.current = null
    }
  }, [probeRef, setLocale])
  return null
}

describe('OAS-421-T1 HomePage', () => {
  it('renders the localized title and trust banner in English by default', () => {
    render(
      <LocaleProvider initialLocale="en">
        <HomePage />
      </LocaleProvider>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('XSWU')
    expect(
      screen.getByText('No ads. No accounts. No tracking.'),
    ).toBeInTheDocument()
  })

  it('exposes labelled groups for language, age band, and mode selection', () => {
    render(
      <LocaleProvider initialLocale="en">
        <HomePage />
      </LocaleProvider>,
    )
    const language = screen.getByRole('radiogroup', { name: 'Language' })
    const age = screen.getByRole('radiogroup', { name: 'Age' })
    const mode = screen.getByRole('group', { name: 'Mode' })
    expect(language).toBeInTheDocument()
    expect(age).toBeInTheDocument()
    expect(mode).toBeInTheDocument()
    expect(within(language).getAllByRole('button')).toHaveLength(3)
    expect(within(age).getAllByRole('button')).toHaveLength(3)
    expect(within(mode).getAllByRole('button')).toHaveLength(3)
  })

  it('re-renders all labels in Hindi when locale switches and shows no English fallback copy', () => {
    const probeRef: { current: ProbeRef | null } = { current: null }
    render(
      <LocaleProvider initialLocale="en">
        <LocaleProbe probeRef={probeRef} />
        <HomePage />
      </LocaleProvider>,
    )
    expect(probeRef.current).not.toBeNull()
    act(() => {
      probeRef.current!.setLocale('hi')
    })
    expect(
      screen.getByText(
        '\u0915\u094b\u0908 \u0935\u093f\u091c\u094d\u091e\u093e\u092a\u0928 \u0928\u0939\u0940\u0902\u0964 \u0915\u094b\u0908 \u0916\u093e\u0924\u093e \u0928\u0939\u0940\u0902\u0964 \u0915\u094b\u0908 \u091f\u094d\u0930\u0948\u0915\u093f\u0902\u0917 \u0928\u0939\u0940\u0902\u0964',
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('No ads. No accounts. No tracking.'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: '\u092d\u093e\u0937\u093e' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: '\u0909\u092e\u094d\u0930' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: '\u092e\u094b\u0921' })).toBeInTheDocument()
  })

  it('exposes a top-level main landmark for the home screen', () => {
    render(
      <LocaleProvider initialLocale="en">
        <HomePage />
      </LocaleProvider>,
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
