import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { LocaleProvider } from '../i18n/LocaleProvider'
import type { Locale } from '../i18n/t'
import { RewardScreen } from '../components/RewardScreen'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')
const auditDir = resolve(repoRoot, 'audits', 'visual-qa')

const LOCALES: readonly Locale[] = ['en', 'hi', 'es']

describe('OAS-428-T3 RewardScreen JSDOM HTML snapshot per locale', () => {
  it('renders RewardScreen in en/hi/es and writes audits/visual-qa/reward-<locale>.html', () => {
    mkdirSync(auditDir, { recursive: true })
    for (const locale of LOCALES) {
      const { container, unmount } = render(
        <LocaleProvider initialLocale={locale}>
          <RewardScreen
            mode="shape-memory"
            onPlayAgain={() => undefined}
            onChooseAnother={() => undefined}
          />
        </LocaleProvider>,
      )
      const file = resolve(auditDir, `reward-${locale}.html`)
      const html =
        '<!doctype html>\n' +
        `<html lang="${locale}">\n` +
        '<head><meta charset="utf-8"><title>RewardScreen visual QA — ' +
        locale +
        '</title></head>\n' +
        '<body style="font-family: system-ui, sans-serif; padding: 16px;">' +
        container.innerHTML +
        '</body></html>\n'
      writeFileSync(file, html, 'utf8')
      expect(container.querySelector('h2')?.textContent ?? '').not.toBe('')
      unmount()
    }
  })
})
