import { act, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleProvider'
import { STORAGE_KEYS } from '../../state/storage'
import type { AgeBand } from '../../state/usePreferences'
import { ShapeMemoryBoard } from './ShapeMemoryBoard'
import { generateRound } from './generator'

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

function mockMatchMedia(reducedMotion: boolean): void {
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

let mem: Storage

beforeEach(() => {
  mem = createMemoryStorage()
  vi.stubGlobal('localStorage', mem)
  mockMatchMedia(false)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

interface Opts {
  ageBand: AgeBand
  seed?: number
  onComplete?: () => void
  reducedMotion?: boolean
}

function renderBoard(opts: Opts) {
  const { ageBand, seed = 0, onComplete, reducedMotion = false } = opts
  mockMatchMedia(reducedMotion)
  mem.setItem(STORAGE_KEYS.ageBand, JSON.stringify(ageBand))
  return render(
    <LocaleProvider initialLocale="en">
      <ShapeMemoryBoard seed={seed} onComplete={onComplete} />
    </LocaleProvider>,
  )
}

function getCards(): HTMLButtonElement[] {
  const grid = screen.getByTestId('shape-memory-grid')
  return within(grid)
    .getAllByRole('button')
    .filter((el): el is HTMLButtonElement => el instanceof HTMLButtonElement)
}

describe('OAS-424-T2 ShapeMemoryBoard', () => {
  it('renders 6 cards for age band 4-5', () => {
    renderBoard({ ageBand: '4-5' })
    expect(getCards()).toHaveLength(6)
  })

  it('renders 12 cards for age band 6-7', () => {
    renderBoard({ ageBand: '6-7' })
    expect(getCards()).toHaveLength(12)
  })

  it('renders 16 cards for age band 8-9', () => {
    renderBoard({ ageBand: '8-9' })
    expect(getCards()).toHaveLength(16)
  })

  it('initial render: every card is face-down with aria-pressed=false', () => {
    renderBoard({ ageBand: '4-5' })
    for (const card of getCards()) {
      expect(card.getAttribute('aria-label')).toBe('Card, face down')
      expect(card.getAttribute('aria-pressed')).toBe('false')
    }
  })

  it('clicking a card flips it: aria-pressed=true and shape revealed', () => {
    renderBoard({ ageBand: '4-5' })
    const cards = getCards()
    const first = cards[0] as HTMLButtonElement
    act(() => {
      first.click()
    })
    expect(first.getAttribute('aria-pressed')).toBe('true')
    expect(first.getAttribute('aria-label')).not.toBe('Card, face down')
  })

  it('match: two cards with same shape stay revealed', () => {
    renderBoard({ ageBand: '4-5' })
    const round = generateRound('4-5', 0)
    const firstShape = round.deck[0]
    const matchIdx = round.deck.findIndex((s, i) => i !== 0 && s === firstShape)
    expect(matchIdx).toBeGreaterThan(0)

    const cards = getCards()
    act(() => {
      ;(cards[0] as HTMLButtonElement).click()
    })
    act(() => {
      ;(cards[matchIdx] as HTMLButtonElement).click()
    })
    expect(cards[0]!.getAttribute('aria-pressed')).toBe('true')
    expect(cards[matchIdx]!.getAttribute('aria-pressed')).toBe('true')
  })

  it('mismatch: cards flip back after 1000 ms (reduced-motion off)', () => {
    vi.useFakeTimers()
    renderBoard({ ageBand: '4-5' })
    const round = generateRound('4-5', 0)
    const firstShape = round.deck[0]
    const mismatchIdx = round.deck.findIndex(
      (s, i) => i !== 0 && s !== firstShape,
    )
    expect(mismatchIdx).toBeGreaterThan(0)

    const cards = getCards()
    act(() => {
      ;(cards[0] as HTMLButtonElement).click()
    })
    act(() => {
      ;(cards[mismatchIdx] as HTMLButtonElement).click()
    })

    // Both temporarily revealed during resolving
    expect(cards[0]!.getAttribute('aria-pressed')).toBe('true')
    expect(cards[mismatchIdx]!.getAttribute('aria-pressed')).toBe('true')

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Both flipped back
    expect(cards[0]!.getAttribute('aria-pressed')).toBe('false')
    expect(cards[mismatchIdx]!.getAttribute('aria-pressed')).toBe('false')
  })

  it('mismatch flip-back is instant when prefers-reduced-motion is set', () => {
    vi.useFakeTimers()
    renderBoard({ ageBand: '4-5', reducedMotion: true })
    const round = generateRound('4-5', 0)
    const firstShape = round.deck[0]
    const mismatchIdx = round.deck.findIndex(
      (s, i) => i !== 0 && s !== firstShape,
    )

    const cards = getCards()
    act(() => {
      ;(cards[0] as HTMLButtonElement).click()
    })
    act(() => {
      ;(cards[mismatchIdx] as HTMLButtonElement).click()
    })

    // Run only zero-delay timers
    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(cards[0]!.getAttribute('aria-pressed')).toBe('false')
    expect(cards[mismatchIdx]!.getAttribute('aria-pressed')).toBe('false')
  })

  it('rapid double-tap on the same card is ignored', () => {
    renderBoard({ ageBand: '4-5' })
    const cards = getCards()
    const first = cards[0] as HTMLButtonElement

    act(() => {
      first.click()
    })
    const labelAfterOne = first.getAttribute('aria-label')

    act(() => {
      first.click()
    })

    // Still only one card flipped; first remains revealed (treated as no-op).
    expect(first.getAttribute('aria-pressed')).toBe('true')
    expect(first.getAttribute('aria-label')).toBe(labelAfterOne)
    // Other cards still face-down
    for (let i = 1; i < cards.length; i++) {
      expect(cards[i]!.getAttribute('aria-pressed')).toBe('false')
    }
  })

  it('third-card click while resolving is ignored', () => {
    vi.useFakeTimers()
    renderBoard({ ageBand: '4-5' })
    const round = generateRound('4-5', 0)
    const firstShape = round.deck[0]
    const mismatchIdx = round.deck.findIndex(
      (s, i) => i !== 0 && s !== firstShape,
    )
    const thirdIdx = round.deck.findIndex(
      (_, i) => i !== 0 && i !== mismatchIdx,
    )

    const cards = getCards()
    act(() => {
      ;(cards[0] as HTMLButtonElement).click()
    })
    act(() => {
      ;(cards[mismatchIdx] as HTMLButtonElement).click()
    })

    // While resolving, click a third card
    act(() => {
      ;(cards[thirdIdx] as HTMLButtonElement).click()
    })

    // Third card NOT revealed
    expect(cards[thirdIdx]!.getAttribute('aria-pressed')).toBe('false')

    // After timer, board is back to idle and third card still face-down
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(cards[thirdIdx]!.getAttribute('aria-pressed')).toBe('false')
    expect(cards[0]!.getAttribute('aria-pressed')).toBe('false')
  })

  it('drives to win: onComplete called once and all cards stay revealed', () => {
    const onComplete = vi.fn()
    renderBoard({ ageBand: '4-5', onComplete })
    const round = generateRound('4-5', 0)

    // Group indices by shape
    const groups = new Map<string, number[]>()
    round.deck.forEach((s, i) => {
      const list = groups.get(s) ?? []
      list.push(i)
      groups.set(s, list)
    })

    const cards = getCards()
    for (const [, indices] of groups) {
      expect(indices).toHaveLength(2)
      act(() => {
        ;(cards[indices[0]!] as HTMLButtonElement).click()
      })
      act(() => {
        ;(cards[indices[1]!] as HTMLButtonElement).click()
      })
    }

    expect(onComplete).toHaveBeenCalledTimes(1)
    for (const card of cards) {
      expect(card.getAttribute('aria-pressed')).toBe('true')
    }
  })

  it('won state disables further interaction', () => {
    renderBoard({ ageBand: '4-5' })
    const round = generateRound('4-5', 0)
    const groups = new Map<string, number[]>()
    round.deck.forEach((s, i) => {
      const list = groups.get(s) ?? []
      list.push(i)
      groups.set(s, list)
    })
    const cards = getCards()
    for (const [, indices] of groups) {
      act(() => {
        ;(cards[indices[0]!] as HTMLButtonElement).click()
      })
      act(() => {
        ;(cards[indices[1]!] as HTMLButtonElement).click()
      })
    }
    for (const card of cards) {
      expect(card.disabled).toBe(true)
    }
  })
})
