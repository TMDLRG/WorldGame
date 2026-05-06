import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const readme = readFileSync(resolve(here, 'README.md'), 'utf8')

describe('OAS-428-T1 styles README documents tokens contract', () => {
  it.each(['375px', '768px', '1280px'])(
    'documents the %s breakpoint',
    (px) => {
      expect(readme).toContain(px)
    },
  )

  it.each(['100%', '720px', '960px'])(
    'documents container max-width %s',
    (mw) => {
      expect(readme).toContain(mw)
    },
  )

  it('documents the 44px tap-target floor', () => {
    expect(readme).toMatch(/44px/)
  })

  it('documents the 16px minimum body font', () => {
    expect(readme).toMatch(/16px/)
  })

  it('documents the auto-fit grid contract for game boards', () => {
    expect(readme).toMatch(/auto-fit/)
    expect(readme).toMatch(/min\(/)
  })

  it('documents the prefers-reduced-motion policy and the useReducedMotion hook', () => {
    expect(readme).toMatch(/prefers-reduced-motion/)
    expect(readme).toMatch(/useReducedMotion/)
  })
})
