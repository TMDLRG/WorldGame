import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { SkipLink } from './SkipLink'

describe('OAS-427-T1 SkipLink', () => {
  it('renders an anchor that points to #main-content with localized text', () => {
    render(
      <LocaleProvider initialLocale="en">
        <SkipLink />
      </LocaleProvider>,
    )
    const link = screen.getByRole('link', { name: /skip to main/i })
    expect(link).toHaveAttribute('href', '#main-content')
  })

  it('uses the .xswu-skip-link utility so it is visually hidden until focused', () => {
    render(
      <LocaleProvider initialLocale="en">
        <SkipLink />
      </LocaleProvider>,
    )
    const link = screen.getByRole('link', { name: /skip to main/i })
    expect(link.className).toMatch(/xswu-skip-link/)
  })

  it('renders localized copy in Hindi when locale is hi', () => {
    render(
      <LocaleProvider initialLocale="hi">
        <SkipLink />
      </LocaleProvider>,
    )
    const link = screen.getByRole('link')
    expect(link.textContent ?? '').not.toMatch(/^Skip to main$/)
    expect(link.textContent?.length ?? 0).toBeGreaterThan(0)
  })

  it('renders localized copy in Spanish when locale is es', () => {
    render(
      <LocaleProvider initialLocale="es">
        <SkipLink />
      </LocaleProvider>,
    )
    const link = screen.getByRole('link')
    expect(link.textContent ?? '').not.toMatch(/^Skip to main$/)
    expect(link.textContent?.length ?? 0).toBeGreaterThan(0)
  })
})
