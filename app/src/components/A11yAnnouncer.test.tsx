import { act, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { A11yAnnouncer } from './A11yAnnouncer'

describe('OAS-427-T2 A11yAnnouncer', () => {
  it('renders a single polite, atomic, status live region', () => {
    const { container } = render(<A11yAnnouncer message="" />)
    const region = container.querySelector('[role="status"]')
    expect(region).not.toBeNull()
    expect(region!.getAttribute('aria-live')).toBe('polite')
    expect(region!.getAttribute('aria-atomic')).toBe('true')
  })

  it('mirrors the message prop into the live region body so SR announces it', () => {
    const { container, rerender } = render(<A11yAnnouncer message="Nice match" />)
    const region = container.querySelector('[role="status"]')
    expect(region?.textContent).toContain('Nice match')
    rerender(<A11yAnnouncer message="Try again" />)
    expect(region?.textContent).toContain('Try again')
  })

  it('hides the live region from sighted users (visually but not from AT)', () => {
    const { container } = render(<A11yAnnouncer message="Nice" />)
    const region = container.querySelector('[role="status"]') as HTMLElement
    expect(region.className).toMatch(/xswu-visually-hidden|sr-only/)
  })

  it('updates the live region when message changes between calls', () => {
    const { container, rerender } = render(<A11yAnnouncer message="A" />)
    const region = container.querySelector('[role="status"]')!
    const first = region.textContent
    act(() => {
      rerender(<A11yAnnouncer message="B" />)
    })
    expect(region.textContent).not.toBe(first)
  })
})
