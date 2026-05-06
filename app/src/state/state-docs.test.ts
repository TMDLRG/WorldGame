import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PREF_FIELDS } from './migrations'

const here = dirname(fileURLToPath(import.meta.url))
const readmePath = resolve(here, 'README.md')
const readme = readFileSync(readmePath, 'utf8')

describe('OAS-423-T3 src/state/README.md', () => {
  it('exists and is non-empty', () => {
    expect(readme.length).toBeGreaterThan(200)
  })

  it('documents every allow-listed field by name', () => {
    for (const field of PREF_FIELDS) {
      expect(readme).toContain(field)
    }
  })

  it('documents the migration policy explicitly', () => {
    expect(readme.toLowerCase()).toContain('forward-only')
    expect(readme.toLowerCase()).toContain('defaults on unknown')
  })

  it('mentions PII to satisfy the no-PII allow-list trust posture', () => {
    expect(readme).toMatch(/PII/)
  })

  it('explains how to add a future migration', () => {
    expect(readme).toMatch(/v1\s*[\u2192>-]+\s*v2/i)
  })
})
