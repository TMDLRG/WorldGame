import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')
const auditDir = resolve(repoRoot, 'audits', 'visual-qa')

const ROUTES = ['home', 'shape-memory', 'color-shape', 'math-match'] as const
const LOCALES = ['en', 'hi', 'es'] as const
const REWARD_LOCALES = ['en', 'hi', 'es'] as const

interface SummaryEntry {
  route: string
  locale: string
  viewport: { width: number; height: number }
  scrollWidth: number
  clientWidth: number
  noHorizontalOverflow: boolean
}

interface SummaryFile {
  generatedAt: string
  viewport: { width: number; height: number }
  routes: readonly string[]
  locales: readonly string[]
  results: SummaryEntry[]
}

describe('OAS-428-T3 visual QA artifacts at 375 px in en/hi/es', () => {
  it('audits/visual-qa/ exists and contains a generated summary', () => {
    expect(existsSync(auditDir)).toBe(true)
    const summary = resolve(auditDir, 'visual-qa.json')
    expect(existsSync(summary)).toBe(true)
  })

  it('captures one PNG per (route, locale) at 375 px', () => {
    for (const route of ROUTES) {
      for (const locale of LOCALES) {
        const png = resolve(auditDir, `${route}-${locale}.png`)
        expect(existsSync(png), `missing ${route}-${locale}.png`).toBe(true)
        const size = statSync(png).size
        expect(size, `${route}-${locale}.png is empty`).toBeGreaterThan(0)
      }
    }
  })

  it('summary records viewport 375x812 and zero horizontal overflow per capture', () => {
    const text = readFileSync(resolve(auditDir, 'visual-qa.json'), 'utf8')
    const summary = JSON.parse(text) as SummaryFile
    expect(summary.viewport).toEqual({ width: 375, height: 812 })
    expect(summary.locales).toEqual(['en', 'hi', 'es'])
    const expectedCaptures = ROUTES.length * LOCALES.length
    expect(summary.results).toHaveLength(expectedCaptures)
    for (const result of summary.results) {
      expect(
        result.noHorizontalOverflow,
        `horizontal overflow detected for ${result.route}-${result.locale}: scrollWidth=${result.scrollWidth} clientWidth=${result.clientWidth}`,
      ).toBe(true)
      expect(result.viewport).toEqual({ width: 375, height: 812 })
    }
  })

  it('captures one HTML snapshot of the unrouted RewardScreen per locale', () => {
    for (const locale of REWARD_LOCALES) {
      const html = resolve(auditDir, `reward-${locale}.html`)
      expect(existsSync(html), `missing reward-${locale}.html`).toBe(true)
      const size = statSync(html).size
      expect(size, `reward-${locale}.html is empty`).toBeGreaterThan(0)
    }
  })

  it('audits/visual-qa/README.md documents the per-locale 375 px QA process', () => {
    const readme = resolve(auditDir, 'README.md')
    expect(existsSync(readme)).toBe(true)
    const text = readFileSync(readme, 'utf8')
    expect(text).toMatch(/375/i)
    expect(text).toMatch(/en/i)
    expect(text).toMatch(/hi/i)
    expect(text).toMatch(/es/i)
    expect(text).toMatch(/playwright/i)
  })
})
