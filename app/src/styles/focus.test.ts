import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const layoutCss = readFileSync(resolve(here, 'layout.css'), 'utf8')

describe('OAS-427-T1 focus-visible contract in layout.css', () => {
  it('declares a global :focus-visible rule (not :focus, to keep mouse users ring-free)', () => {
    expect(layoutCss).toMatch(/:focus-visible\s*\{/)
    const focusVisibleBlock = layoutCss.match(/:focus-visible\s*\{[\s\S]*?\}/)
    expect(focusVisibleBlock).not.toBeNull()
  })

  it('uses a 3px focus ring width via a CSS variable, with a >=2px outline-offset', () => {
    expect(layoutCss).toMatch(/--xswu-focus-ring-width\s*:\s*3px/)
    expect(layoutCss).toMatch(/--xswu-focus-ring-offset\s*:\s*[2-9](\.\d+)?px/)
    const block = layoutCss.match(/:focus-visible\s*\{[\s\S]*?\}/)
    expect(block).not.toBeNull()
    const text = block![0]
    expect(text).toMatch(
      /outline:\s*var\(--xswu-focus-ring-width\)[^;]*var\(--xswu-focus-ring-color\)/,
    )
    expect(text).toMatch(/outline-offset:\s*var\(--xswu-focus-ring-offset\)/)
  })

  it('does not zero out outline globally (no `* { outline: none }` regression)', () => {
    const stripped = layoutCss.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(stripped).not.toMatch(/\*\s*\{\s*outline:\s*none/)
  })

  it('exposes a CSS custom property for the focus ring color so high-contrast Windows mode can override', () => {
    expect(layoutCss).toMatch(/--xswu-focus-ring(?:-color)?\s*:/)
  })
})
