import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleProvider'
import type { Locale } from '../i18n/t'
import { UserGuide } from './UserGuide'

function renderGuide(locale: Locale = 'en') {
  return render(
    <LocaleProvider initialLocale={locale}>
      <MemoryRouter initialEntries={['/help']}>
        <Routes>
          <Route path="/help" element={<UserGuide />} />
          <Route path="/" element={<div data-testid="home-stub">home</div>} />
        </Routes>
      </MemoryRouter>
    </LocaleProvider>,
  )
}

describe('OAS-help UserGuide route', () => {
  it('renders the guide title as h1 in en', () => {
    renderGuide('en')
    expect(
      screen.getByRole('heading', { level: 1, name: /how to play xswu/i }),
    ).toBeInTheDocument()
  })

  it('renders both kids and parents section headings', () => {
    renderGuide('en')
    expect(
      screen.getByRole('heading', { level: 2, name: /for kids/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /for parents/i }),
    ).toBeInTheDocument()
  })

  it('renders all five kid paragraphs (welcome + 3 modes + have fun)', () => {
    renderGuide('en')
    expect(screen.getByText(/welcome/i)).toBeInTheDocument()
    expect(screen.getByText(/shape memory: tap two cards/i)).toBeInTheDocument()
    expect(screen.getByText(/color and shape: read the prompt/i)).toBeInTheDocument()
    expect(screen.getByText(/math match: read the question/i)).toBeInTheDocument()
    expect(screen.getByText(/no points and no timer/i)).toBeInTheDocument()
  })

  it('renders all five parent paragraphs', () => {
    renderGuide('en')
    expect(screen.getByText(/no personal information/i)).toBeInTheDocument()
    expect(screen.getByText(/age bands tune difficulty/i)).toBeInTheDocument()
    expect(screen.getByText(/three modes are available/i)).toBeInTheDocument()
    expect(
      screen.getByText(/all controls are keyboard reachable/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/saved in your browser only/i)).toBeInTheDocument()
  })

  it('renders Hindi content end-to-end (Devanagari title visible)', () => {
    renderGuide('hi')
    expect(
      screen.getByRole('heading', { level: 1, name: /XSWU कैसे खेलें/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/अभिभावकों के लिए/)).toBeInTheDocument()
  })

  it('renders Spanish content end-to-end (accented title visible)', () => {
    renderGuide('es')
    expect(
      screen.getByRole('heading', { level: 1, name: /Cómo jugar a XSWU/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Para adultos/)).toBeInTheDocument()
  })

  it('Back home button navigates to /', () => {
    renderGuide('en')
    const back = screen.getByRole('button', { name: /back home/i })
    act(() => {
      back.click()
    })
    expect(screen.getByTestId('home-stub')).toBeInTheDocument()
  })

  it('uses semantic <section> with aria-labelledby for both audiences', () => {
    const { container } = renderGuide('en')
    const sections = container.querySelectorAll('section[aria-labelledby]')
    expect(sections.length).toBe(2)
    expect(sections[0]?.getAttribute('aria-labelledby')).toBe('guide-kids')
    expect(sections[1]?.getAttribute('aria-labelledby')).toBe('guide-parents')
  })

  it('emits no a11y warnings (placeholder for future axe-core integration)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderGuide('en')
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
