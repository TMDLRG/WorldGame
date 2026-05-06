import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axe from 'axe-core'
import type { Result } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { HomePage } from '../routes/HomePage'
import { SkipLink } from '../components/SkipLink'
import { A11yAnnouncer } from '../components/A11yAnnouncer'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')
const auditDoc = resolve(repoRoot, 'audits', 'a11y-remediation.md')

async function runAxe(node: HTMLElement): Promise<Result[]> {
  const result = await axe.run(node, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  })
  return result.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  )
}

describe('OAS-427-T3 axe-core: zero serious/critical violations', () => {
  it('HomePage has no serious or critical axe violations (English)', async () => {
    const { container } = render(
      <MemoryRouter>
        <LocaleProvider initialLocale="en">
          <HomePage />
        </LocaleProvider>
      </MemoryRouter>,
    )
    const violations = await runAxe(container)
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([])
  }, 15000)

  it('SkipLink in isolation has no serious or critical axe violations', async () => {
    const { container } = render(
      <LocaleProvider initialLocale="en">
        <main id="main-content" tabIndex={-1}>
          anchor target
        </main>
        <SkipLink />
      </LocaleProvider>,
    )
    const violations = await runAxe(container)
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([])
  }, 15000)

  it('A11yAnnouncer has no serious or critical axe violations', async () => {
    const { container } = render(<A11yAnnouncer message="Nice match" />)
    const violations = await runAxe(container)
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([])
  }, 15000)
})

describe('OAS-427-T3 a11y remediation log', () => {
  it('audits/a11y-remediation.md exists and is non-empty', () => {
    expect(existsSync(auditDoc)).toBe(true)
    const text = readFileSync(auditDoc, 'utf8')
    expect(text.length).toBeGreaterThan(0)
  })

  it('lists at least one finding-or-clean entry per audited screen', () => {
    const text = readFileSync(auditDoc, 'utf8')
    expect(text).toMatch(/HomePage/i)
    expect(text).toMatch(/SkipLink/i)
    expect(text).toMatch(/A11yAnnouncer/i)
  })

  it('records the axe-core version used so threshold drift is traceable', () => {
    const text = readFileSync(auditDoc, 'utf8')
    expect(text).toMatch(/axe-core\s+v?\d+\.\d+\.\d+/)
  })
})
