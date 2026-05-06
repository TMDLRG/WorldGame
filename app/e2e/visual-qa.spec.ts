import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect, type Page } from '@playwright/test'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..')
const auditDir = resolve(repoRoot, 'audits', 'visual-qa')

mkdirSync(auditDir, { recursive: true })

const ROUTES = [
  { id: 'home', path: '/' },
  { id: 'shape-memory', path: '/play/shape-memory' },
  { id: 'color-shape', path: '/play/color-shape' },
  { id: 'math-match', path: '/play/math-match' },
] as const

const LOCALES = ['en', 'hi', 'es'] as const
type LocaleId = (typeof LOCALES)[number]

const LOCALE_INDEX: Record<LocaleId, number> = { en: 0, hi: 1, es: 2 }

interface CaptureResult {
  route: string
  locale: LocaleId
  viewport: { width: number; height: number }
  scrollWidth: number
  clientWidth: number
  noHorizontalOverflow: boolean
}

const results: CaptureResult[] = []

async function selectLocale(page: Page, locale: LocaleId) {
  if (locale === 'en') return
  const radiogroup = page.getByRole('radiogroup').first()
  const buttons = radiogroup.getByRole('button')
  await buttons.nth(LOCALE_INDEX[locale]).click()
  await expect(buttons.nth(LOCALE_INDEX[locale])).toHaveAttribute(
    'aria-pressed',
    'true',
  )
}

async function measureOverflow(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement
    return {
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
    }
  })
}

test.describe('OAS-428-T3 visual QA at 375 px in en/hi/es', () => {
  for (const route of ROUTES) {
    for (const locale of LOCALES) {
      test(`${route.id} - ${locale}`, async ({ page }) => {
        await page.goto('/')
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        await selectLocale(page, locale)
        if (route.path !== '/') {
          await page.goto(route.path)
        }
        await page.waitForLoadState('networkidle')
        const file = resolve(auditDir, `${route.id}-${locale}.png`)
        await page.screenshot({ path: file, fullPage: true })
        const { scrollWidth, clientWidth } = await measureOverflow(page)
        const result: CaptureResult = {
          route: route.id,
          locale,
          viewport: { width: 375, height: 812 },
          scrollWidth,
          clientWidth,
          noHorizontalOverflow: scrollWidth <= clientWidth,
        }
        results.push(result)
        expect(result.noHorizontalOverflow).toBe(true)
      })
    }
  }

  test.afterAll(async () => {
    const summary = {
      generatedAt: new Date().toISOString(),
      viewport: { width: 375, height: 812 },
      routes: ROUTES.map((r) => r.id),
      locales: LOCALES,
      results,
    }
    writeFileSync(
      resolve(auditDir, 'visual-qa.json'),
      JSON.stringify(summary, null, 2) + '\n',
      'utf8',
    )
  })
})
