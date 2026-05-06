import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  SHAPE_POOL,
  generateRound,
  type Round,
  type Shape,
} from './generator'
import type { AgeBand } from '../../state/usePreferences'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SIZING: Record<AgeBand, { pairs: number; length: number }> = {
  '4-5': { pairs: 3, length: 6 },
  '6-7': { pairs: 6, length: 12 },
  '8-9': { pairs: 8, length: 16 },
}

const BANDS: readonly AgeBand[] = ['4-5', '6-7', '8-9']
const SEEDS: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7]

function counts(deck: readonly Shape[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const s of deck) out[s] = (out[s] ?? 0) + 1
  return out
}

describe('OAS-424-T1 Shape Memory round generator', () => {
  it('produces correct pairs and deck length per age band (sizing)', () => {
    for (const band of BANDS) {
      const round: Round = generateRound(band, 42)
      expect(round.pairs, `pairs for ${band}`).toBe(SIZING[band].pairs)
      expect(round.deck.length, `deck length for ${band}`).toBe(
        SIZING[band].length,
      )
    }
  })

  it('is deterministic: same (ageBand, seed) returns the same deck', () => {
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const a = generateRound(band, seed)
        const b = generateRound(band, seed)
        expect(b.deck, `determinism band=${band} seed=${seed}`).toEqual(a.deck)
      }
    }
  })

  it('property: every shape that appears, appears exactly twice', () => {
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const round = generateRound(band, seed)
        const c = counts(round.deck)
        for (const [shape, n] of Object.entries(c)) {
          expect(n, `even counts band=${band} seed=${seed} shape=${shape}`).toBe(
            2,
          )
        }
      }
    }
  })

  it('property: deck length always equals pairs * 2', () => {
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const round = generateRound(band, seed)
        expect(
          round.deck.length,
          `length=pairs*2 band=${band} seed=${seed}`,
        ).toBe(round.pairs * 2)
      }
    }
  })

  it('property: distinct shape count equals pairs', () => {
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const round = generateRound(band, seed)
        const distinct = new Set(round.deck).size
        expect(
          distinct,
          `distinct=pairs band=${band} seed=${seed}`,
        ).toBe(round.pairs)
      }
    }
  })

  it('every deck element belongs to the 8-shape pool', () => {
    const pool = new Set<Shape>(SHAPE_POOL)
    expect(pool.size).toBe(8)
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const round = generateRound(band, seed)
        for (const s of round.deck) {
          expect(pool.has(s), `pool contains ${s}`).toBe(true)
        }
      }
    }
  })

  it('seed 0 produces a non-trivial shuffle (not the natural duplicate-pair order)', () => {
    for (const band of BANDS) {
      const round = generateRound(band, 0)
      const naturalOrder: Shape[] = []
      const distinct = Array.from(new Set(round.deck))
      for (const s of distinct) {
        naturalOrder.push(s, s)
      }
      expect(
        round.deck,
        `seed 0 not equal to trivial pair order for band=${band}`,
      ).not.toEqual(naturalOrder)
    }
  })

  it('source contains no Math.random() call (purity guard)', () => {
    const generatorSrc = readFileSync(
      join(__dirname, 'generator.ts'),
      'utf8',
    )
    const prngSrc = readFileSync(join(__dirname, 'prng.ts'), 'utf8')
    const callRe = /Math\.random\s*\(/
    expect(callRe.test(generatorSrc), 'generator.ts').toBe(false)
    expect(callRe.test(prngSrc), 'prng.ts').toBe(false)
  })
})
