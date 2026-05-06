import { act, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleProvider'
import { STORAGE_KEYS } from '../../state/storage'
import type { AgeBand } from '../../state/usePreferences'
import { ColorShapeBoard } from './ColorShapeBoard'
import { generateRound, type CardSpec } from './generator'

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
}

function renderBoard(opts: Opts) {
  const { ageBand, seed = 0, onComplete, reducedMotion = false } = opts
  mockMatchMedia(reducedMotion)
  mem.setItem(STORAGE_KEYS.ageBand, JSON.stringify(ageBand))
  return render(
    <LocaleProvider initialLocale="en">
      <ColorShapeBoard seed={seed} onComplete={onComplete} />
    </LocaleProvider>,
  )
}

function getChoiceButtons(): HTMLButtonElement[] {
  const grid = screen.getByTestId('cs-choices')
  return within(grid)
    .getAllByRole('button')
    .filter((el): el is HTMLButtonElement => el instanceof HTMLButtonElement)
}

function findCorrectIdx(target: CardSpec, choices: CardSpec[]): number {
  return choices.findIndex(
    (c) => c.color === target.color && c.shape === target.shape,
  )
}

describe('OAS-425-T2 ColorShapeBoard', () => {
  it('renders the prompt for the current target', () => {
    renderBoard({ ageBand: '4-5' })
    const prompt = screen.getByTestId('prompt')
    expect(prompt.textContent ?? '').toMatch(/find the/i)
  })

  it('renders 3 choice buttons for age 4-5', () => {
    renderBoard({ ageBand: '4-5' })
    expect(getChoiceButtons()).toHaveLength(3)
  })

  it('renders 4 choice buttons for age 6-7', () => {
    renderBoard({ ageBand: '6-7' })
    expect(getChoiceButtons()).toHaveLength(4)
  })

  it('renders 5 choice buttons for age 8-9', () => {
    renderBoard({ ageBand: '8-9' })
    expect(getChoiceButtons()).toHaveLength(5)
  })

  it('correct pick advances to next prompt', () => {
    renderBoard({ ageBand: '4-5' })
    const round = generateRound('4-5', 0)
    const target0 = round.prompts[0]!.target
    const target1 = round.prompts[1]!.target
    const initialPromptText = screen.getByTestId('prompt').textContent ?? ''
    expect(initialPromptText).toContain(target0.color)

    const correctIdx = findCorrectIdx(target0, round.prompts[0]!.choices)
    expect(correctIdx).toBeGreaterThanOrEqual(0)

    const buttons = getChoiceButtons()
    act(() => {
      buttons[correctIdx]!.click()
    })

    const nextPromptText = screen.getByTestId('prompt').textContent ?? ''
    expect(nextPromptText).toContain(target1.color)
  })

  it('incorrect pick marks data-incorrect on that button and surfaces try-again feedback', () => {
    renderBoard({ ageBand: '4-5' })
    const round = generateRound('4-5', 0)
    const target = round.prompts[0]!.target
    const wrongIdx = round.prompts[0]!.choices.findIndex(
      (c) => !(c.color === target.color && c.shape === target.shape),
    )

    const buttons = getChoiceButtons()
    act(() => {
      buttons[wrongIdx]!.click()
    })

    expect(buttons[wrongIdx]!.getAttribute('data-incorrect')).toBe('true')
    expect(screen.getByTestId('feedback').textContent ?? '').toMatch(
      /try again/i,
    )
  })

  it('incorrect pick leaves all buttons enabled', () => {
    renderBoard({ ageBand: '4-5' })
    const round = generateRound('4-5', 0)
    const target = round.prompts[0]!.target
    const wrongIdx = round.prompts[0]!.choices.findIndex(
      (c) => !(c.color === target.color && c.shape === target.shape),
    )

    const buttons = getChoiceButtons()
    act(() => {
      buttons[wrongIdx]!.click()
    })

    for (const b of buttons) expect(b.disabled).toBe(false)
  })

  it('six correct picks call onComplete exactly once', () => {
    const onComplete = vi.fn()
    renderBoard({ ageBand: '4-5', onComplete })
    const round = generateRound('4-5', 0)

    for (let i = 0; i < 6; i++) {
      const target = round.prompts[i]!.target
      const correctIdx = findCorrectIdx(target, round.prompts[i]!.choices)
      const buttons = getChoiceButtons()
      act(() => {
        buttons[correctIdx]!.click()
      })
    }

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('reduced-motion: root has data-animate="false"', () => {
    renderBoard({ ageBand: '4-5', reducedMotion: true })
    const root = screen.getByRole('main')
    expect(root.getAttribute('data-animate')).toBe('false')
  })

  it('each choice button has aria-label including color and shape tokens', () => {
    renderBoard({ ageBand: '4-5' })
    const round = generateRound('4-5', 0)
    const choices = round.prompts[0]!.choices
    const buttons = getChoiceButtons()
    buttons.forEach((b, i) => {
      const label = b.getAttribute('aria-label') ?? ''
      expect(label).toContain(choices[i]!.color)
      expect(label).toContain(choices[i]!.shape)
    })
  })
})
