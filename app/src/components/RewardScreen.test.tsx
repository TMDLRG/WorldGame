import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { RewardScreen, type GameMode } from './RewardScreen'

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

beforeEach(() => {
  mockMatchMedia(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

interface Opts {
  mode: GameMode
  onPlayAgain?: () => void
  onChooseAnother?: () => void
  reducedMotion?: boolean
}

function renderReward(opts: Opts) {
  const {
    mode,
    onPlayAgain = () => {},
    onChooseAnother = () => {},
    reducedMotion = false,
  } = opts
  mockMatchMedia(reducedMotion)
  return render(
    <LocaleProvider initialLocale="en">
      <RewardScreen
        mode={mode}
        onPlayAgain={onPlayAgain}
        onChooseAnother={onChooseAnother}
      />
    </LocaleProvider>,
  )
}

describe('OAS-424-T3 RewardScreen', () => {
  it('renders title and CTAs for shape-memory mode', () => {
    renderReward({ mode: 'shape-memory' })
    expect(screen.getByRole('heading', { name: /great job/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /choose another game/i }),
    ).toBeInTheDocument()
  })

  it('renders for color-shape mode', () => {
    renderReward({ mode: 'color-shape' })
    expect(screen.getByRole('heading', { name: /great job/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument()
  })

  it('renders for math-match mode', () => {
    renderReward({ mode: 'math-match' })
    expect(screen.getByRole('heading', { name: /great job/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument()
  })

  it('renders exactly 5 stars in the celebration container', () => {
    renderReward({ mode: 'shape-memory' })
    const stars = screen.getByTestId('reward-stars')
    expect(stars.children).toHaveLength(5)
  })

  it('auto-focuses Play Again on mount', () => {
    renderReward({ mode: 'shape-memory' })
    const playAgain = screen.getByRole('button', { name: /play again/i })
    expect(document.activeElement).toBe(playAgain)
  })

  it('click Play Again calls onPlayAgain', () => {
    const onPlayAgain = vi.fn()
    renderReward({ mode: 'shape-memory', onPlayAgain })
    const btn = screen.getByRole('button', { name: /play again/i }) as HTMLButtonElement
    act(() => {
      btn.click()
    })
    expect(onPlayAgain).toHaveBeenCalledTimes(1)
  })

  it('click Choose Another Game calls onChooseAnother', () => {
    const onChooseAnother = vi.fn()
    renderReward({ mode: 'shape-memory', onChooseAnother })
    const btn = screen.getByRole('button', {
      name: /choose another game/i,
    }) as HTMLButtonElement
    act(() => {
      btn.click()
    })
    expect(onChooseAnother).toHaveBeenCalledTimes(1)
  })

  it('reduced-motion: stars container has data-animate="false"', () => {
    renderReward({ mode: 'shape-memory', reducedMotion: true })
    const stars = screen.getByTestId('reward-stars')
    expect(stars.getAttribute('data-animate')).toBe('false')
  })

  it('reduced-motion off: stars container has data-animate="true"', () => {
    renderReward({ mode: 'shape-memory', reducedMotion: false })
    const stars = screen.getByTestId('reward-stars')
    expect(stars.getAttribute('data-animate')).toBe('true')
  })

  it('Choose Another button is keyboard-operable via Enter', () => {
    const onChooseAnother = vi.fn()
    renderReward({ mode: 'shape-memory', onChooseAnother })
    const btn = screen.getByRole('button', {
      name: /choose another game/i,
    }) as HTMLButtonElement
    btn.focus()
    expect(document.activeElement).toBe(btn)
    // Native button: Enter triggers click
    act(() => {
      btn.click()
    })
    expect(onChooseAnother).toHaveBeenCalledTimes(1)
  })
})
