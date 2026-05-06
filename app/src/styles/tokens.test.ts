import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  BREAKPOINTS,
  CONTAINER_MAX_WIDTH,
  CONTAINER_PADDING,
  MIN_TAP_TARGET_PX,
  MIN_BODY_FONT_PX,
  mediaQueryAtLeast,
} from './tokens'

const here = dirname(fileURLToPath(import.meta.url))
const layoutCss = readFileSync(resolve(here, 'layout.css'), 'utf8')

describe('OAS-428-T1 design tokens', () => {
  it('defines sm/md/lg breakpoints in pixels', () => {
    expect(BREAKPOINTS.sm).toBe(375)
    expect(BREAKPOINTS.md).toBe(768)
    expect(BREAKPOINTS.lg).toBe(1280)
  })

  it('defines container max-widths matching design system (100%/720/960)', () => {
    expect(CONTAINER_MAX_WIDTH.sm).toBe('100%')
    expect(CONTAINER_MAX_WIDTH.md).toBe('720px')
    expect(CONTAINER_MAX_WIDTH.lg).toBe('960px')
  })

  it('defines per-breakpoint horizontal padding 16/24/32 px', () => {
    expect(CONTAINER_PADDING.sm).toBe(16)
    expect(CONTAINER_PADDING.md).toBe(24)
    expect(CONTAINER_PADDING.lg).toBe(32)
  })

  it('exposes a minimum 44 px tap target token to keep mobile a11y', () => {
    expect(MIN_TAP_TARGET_PX).toBe(44)
  })

  it('exposes a minimum 16 px body font to prevent iOS Safari auto-zoom on input focus', () => {
    expect(MIN_BODY_FONT_PX).toBe(16)
  })

  it('mediaQueryAtLeast(sm|md|lg) returns standard min-width media queries', () => {
    expect(mediaQueryAtLeast('sm')).toBe('(min-width: 375px)')
    expect(mediaQueryAtLeast('md')).toBe('(min-width: 768px)')
    expect(mediaQueryAtLeast('lg')).toBe('(min-width: 1280px)')
  })
})

describe('OAS-428-T1 layout.css contract', () => {
  it('declares the .xswu-container class with mobile-first horizontal padding', () => {
    expect(layoutCss).toMatch(/\.xswu-container\s*\{[\s\S]*?padding[^;]*16px/)
  })

  it('upgrades container max-width and padding at md and lg breakpoints', () => {
    expect(layoutCss).toMatch(/@media\s*\(min-width:\s*768px\)/)
    expect(layoutCss).toMatch(/@media\s*\(min-width:\s*1280px\)/)
    expect(layoutCss).toMatch(/max-width:\s*720px/)
    expect(layoutCss).toMatch(/max-width:\s*960px/)
  })

  it('uses CSS Grid auto-fit with min(width, 1fr) for game boards', () => {
    expect(layoutCss).toMatch(/\.xswu-board\s*\{[\s\S]*?display:\s*grid/)
    expect(layoutCss).toMatch(/auto-fit/)
    expect(layoutCss).toMatch(/min\(/)
    expect(layoutCss).toMatch(/1fr/)
  })

  it('scales typography with clamp() and pins minimum body font at 16px', () => {
    expect(layoutCss).toMatch(/clamp\(/)
    expect(layoutCss).toMatch(/font-size:\s*16px/)
  })

  it('pins minimum tap target via a .xswu-tappable utility', () => {
    expect(layoutCss).toMatch(/\.xswu-tappable\s*\{[\s\S]*?min-height:\s*44px/)
    expect(layoutCss).toMatch(/\.xswu-tappable\s*\{[\s\S]*?min-width:\s*44px/)
  })
})
