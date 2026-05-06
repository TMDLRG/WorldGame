import { act, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleProvider'
import { STORAGE_KEYS } from '../../state/storage'
import type { AgeBand } from '../../state/usePreferences'
import { MathMatchBoard } from './MathMatchBoard'
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

function mockMatchMedia(reduce: boolean): void {
  const impl = (q: string): MediaQueryList =>
    ({
      matches: reduce && q.includes('prefers-reduced-motion: reduce'),
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
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

interface Opts {
  ageBand: AgeBand
  seed?: number
  onComplete?: () => void
  reducedMotion?: boolean
  locale?: 'en' | 'hi' | 'es'
}

function renderBoard(opts: Opts) {
  const {
    ageBand,
    seed = 0,
    onComplete,
    reducedMotion = false,
    locale = 'en',
  } = opts
  mockMatchMedia(reducedMotion)
  mem.setItem(STORAGE_KEYS.ageBand, JSON.stringify(ageBand))
  return render(
    <LocaleProvider initialLocale={locale}>
      <MathMatchBoard seed={seed} onComplete={onComplete} />
    </LocaleProvider>,
  )
}

function getChoices(): HTMLButtonElement[] {
  const grid = screen.getByTestId('math-choices')
  return within(grid)
    .getAllByRole('button')
    .filter((el): el is HTMLButtonElement => el instanceof HTMLButtonElement)
}

describe('OAS-426-T2 MathMatchBoard', () => {
  it('renders prompt with expression for an add round (band 6-7)', () => {
    renderBoard({ ageBand: '6-7' })
    const prompt = screen.getByTestId('prompt')
    expect(prompt.textContent ?? '').toMatch(/[+\-×0-9]/)
  })

  it('renders 4 choice buttons for age 4-5', () => {
    renderBoard({ ageBand: '4-5' })
    expect(getChoices()).toHaveLength(4)
  })

  it('renders 4 choice buttons for age 6-7', () => {
    renderBoard({ ageBand: '6-7' })
    expect(getChoices()).toHaveLength(4)
  })

  it('renders 5 choice buttons for age 8-9', () => {
    renderBoard({ ageBand: '8-9' })
    expect(getChoices()).toHaveLength(5)
  })

  it('correct pick advances to next prompt', () => {
    renderBoard({ ageBand: '6-7' })
    const round = generateRound('6-7', 0)
    const correctIdx0 = round.prompts[0]!.choices.indexOf(
      round.prompts[0]!.answer,
    )

    const initialPromptText = screen.getByTestId('prompt').textContent ?? ''
    const buttons = getChoices()
    act(() => {
      buttons[correctIdx0]!.click()
    })

    const nextPromptText = screen.getByTestId('prompt').textContent ?? ''
    expect(nextPromptText).not.toBe(initialPromptText)
  })

  it('incorrect pick marks data-incorrect on the button + surfaces try-again', () => {
    renderBoard({ ageBand: '6-7' })
    const round = generateRound('6-7', 0)
    const correct = round.prompts[0]!.answer
    const wrongIdx = round.prompts[0]!.choices.findIndex((c) => c !== correct)

    const buttons = getChoices()
    act(() => {
      buttons[wrongIdx]!.click()
    })

    expect(buttons[wrongIdx]!.getAttribute('data-incorrect')).toBe('true')
    expect(screen.getByTestId('feedback').textContent ?? '').toMatch(
      /try again/i,
    )
  })

  it('incorrect pick leaves all buttons enabled', () => {
    renderBoard({ ageBand: '6-7' })
    const round = generateRound('6-7', 0)
    const correct = round.prompts[0]!.answer
    const wrongIdx = round.prompts[0]!.choices.findIndex((c) => c !== correct)
    const buttons = getChoices()
    act(() => {
      buttons[wrongIdx]!.click()
    })
    for (const b of buttons) expect(b.disabled).toBe(false)
  })

  it('five correct picks call onComplete exactly once', () => {
    const onComplete = vi.fn()
    renderBoard({ ageBand: '6-7', onComplete })
    const round = generateRound('6-7', 0)

    for (let i = 0; i < 5; i++) {
      const correct = round.prompts[i]!.answer
      const correctIdx = round.prompts[i]!.choices.indexOf(correct)
      const buttons = getChoices()
      act(() => {
        buttons[correctIdx]!.click()
      })
    }

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('reduced-motion: root has data-animate="false"', () => {
    renderBoard({ ageBand: '6-7', reducedMotion: true })
    const root = screen.getByRole('main')
    expect(root.getAttribute('data-animate')).toBe('false')
  })

  it('Hindi locale: choice buttons render Devanagari digits', () => {
    renderBoard({ ageBand: '6-7', locale: 'hi' })
    const buttons = getChoices()
    const text = buttons.map((b) => b.textContent ?? '').join('')
    // At least one Devanagari digit (U+0966..U+096F) appears
    expect(/[०-९]/.test(text)).toBe(true)
  })
})
