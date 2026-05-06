import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { en } from './en'
import { es } from './es'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..', '..')
const csvPath = resolve(repoRoot, 'audits', 'i18n', 'es-review.csv')

interface Row {
  key: string
  enValue: string
  currentEs: string
  finalEs: string
  verdict: string
  note: string
}

function parseCsv(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0)
  const [header, ...rest] = lines
  expect(header).toMatch(/^key,en,current_es,final_es,verdict,note$/)
  return rest.map((line) => {
    const cells: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i]
      if (ch === '"' && line[i + 1] === '"' && inQuotes) {
        cur += '"'
        i += 1
        continue
      }
      if (ch === '"') {
        inQuotes = !inQuotes
        continue
      }
      if (ch === ',' && !inQuotes) {
        cells.push(cur)
        cur = ''
        continue
      }
      cur += ch
    }
    cells.push(cur)
    expect(cells, `row=${line}`).toHaveLength(6)
    const [key, enValue, currentEs, finalEs, verdict, note] = cells as [
      string,
      string,
      string,
      string,
      string,
      string,
    ]
    return { key, enValue, currentEs, finalEs, verdict, note }
  })
}

describe('OAS-429-T2 es-review.csv contract', () => {
  it('exists at audits/i18n/es-review.csv and is non-empty', () => {
    expect(existsSync(csvPath)).toBe(true)
    const text = readFileSync(csvPath, 'utf8')
    expect(text.length).toBeGreaterThan(0)
  })

  it('has one row per key in en (no missing keys, no extras)', () => {
    const text = readFileSync(csvPath, 'utf8')
    const rows = parseCsv(text)
    const enKeys = Object.keys(en).sort()
    const csvKeys = rows.map((r) => r.key).sort()
    expect(csvKeys).toEqual(enKeys)
  })

  it('every row carries an Approved or Revised verdict (no Needs Discussion left)', () => {
    const text = readFileSync(csvPath, 'utf8')
    const rows = parseCsv(text)
    for (const row of rows) {
      expect(['Approved', 'Revised'], `row=${row.key}`).toContain(row.verdict)
    }
  })

  it('every Revised row supplies a non-empty reviewer note', () => {
    const text = readFileSync(csvPath, 'utf8')
    const rows = parseCsv(text)
    const revised = rows.filter((r) => r.verdict === 'Revised')
    for (const row of revised) {
      expect(row.note.length, `row=${row.key}`).toBeGreaterThan(0)
    }
  })

  it('every csv final_es matches the live src/i18n/dictionaries/es.ts value (the dictionary has been updated)', () => {
    const text = readFileSync(csvPath, 'utf8')
    const rows = parseCsv(text)
    for (const row of rows) {
      const live = (es as Record<string, string | undefined>)[row.key]
      expect(live, `key=${row.key}`).toBeDefined()
      expect(live, `key=${row.key}`).toBe(row.finalEs)
    }
  })

  it('Approved rows declare unchanged values (final_es === current_es)', () => {
    const text = readFileSync(csvPath, 'utf8')
    const rows = parseCsv(text)
    const approved = rows.filter((r) => r.verdict === 'Approved')
    for (const row of approved) {
      expect(row.finalEs, `approved key=${row.key}`).toBe(row.currentEs)
    }
  })
})
