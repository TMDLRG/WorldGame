import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  COLOR_POOL,
  generateRound,
  type CardSpec,
  type Color,
  type ColorShapeRound,
} from './generator'
import { SHAPE_POOL, type Shape } from '../shape-memory/generator'
import type { AgeBand } from '../../state/usePreferences'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CHOICES_PER_BAND: Record<AgeBand, number> = {
  '4-5': 3,
  '6-7': 4,
  '8-9': 5,
}

const BANDS: readonly AgeBand[] = ['4-5', '6-7', '8-9']
const SEEDS: readonly number[] = [0, 1, 2, 3, 4]

function eqCard(a: CardSpec, b: CardSpec): boolean {
  return a.color === b.color && a.shape === b.shape
}

function sharesExactlyOne(a: CardSpec, b: CardSpec): boolean {
  const sameColor = a.color === b.color
  const sameShape = a.shape === b.shape
  return Number(sameColor) + Number(sameShape) === 1
}

describe('OAS-425-T1 Color & Shape round generator', () => {
  it('produces 6 prompts per round for every age band', () => {
    for (const band of BANDS) {
      const round: ColorShapeRound = generateRound(band, 42)
      expect(round.prompts.length, `prompts for ${band}`).toBe(6)
    }
  })

  it('choices per prompt match age-band sizing', () => {
    for (const band of BANDS) {
      const round = generateRound(band, 0)
      for (const p of round.prompts) {
        expect(p.choices.length, `choices for band=${band}`).toBe(
          CHOICES_PER_BAND[band],
        )
      }
    }
  })

  it('is deterministic per (ageBand, seed)', () => {
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const a = generateRound(band, seed)
        const b = generateRound(band, seed)
        expect(b, `determinism band=${band} seed=${seed}`).toEqual(a)
      }
    }
  })

  it('target appears in choices for every prompt', () => {
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const round = generateRound(band, seed)
        round.prompts.forEach((p, i) => {
          const found = p.choices.some((c) => eqCard(c, p.target))
          expect(
            found,
            `target in choices band=${band} seed=${seed} prompt=${i}`,
          ).toBe(true)
        })
      }
    }
  })

  it('all choices in a prompt are pairwise unique', () => {
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const round = generateRound(band, seed)
        round.prompts.forEach((p, i) => {
          const set = new Set(p.choices.map((c) => `${c.color}|${c.shape}`))
          expect(
            set.size,
            `unique choices band=${band} seed=${seed} prompt=${i}`,
          ).toBe(p.choices.length)
        })
      }
    }
  })

  it('every distractor shares exactly one attribute with target', () => {
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const round = generateRound(band, seed)
        round.prompts.forEach((p, i) => {
          const distractors = p.choices.filter((c) => !eqCard(c, p.target))
          for (const d of distractors) {
            expect(
              sharesExactlyOne(d, p.target),
              `distractor invariant band=${band} seed=${seed} prompt=${i}`,
            ).toBe(true)
          }
        })
      }
    }
  })

  it('consecutive prompts have non-equal targets', () => {
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const round = generateRound(band, seed)
        for (let i = 1; i < round.prompts.length; i++) {
          expect(
            eqCard(round.prompts[i - 1]!.target, round.prompts[i]!.target),
            `consecutive targets band=${band} seed=${seed} i=${i}`,
          ).toBe(false)
        }
      }
    }
  })

  it('every choice color in COLOR_POOL (10) and shape in SHAPE_POOL (8)', () => {
    expect(COLOR_POOL.length).toBe(10)
    expect(SHAPE_POOL.length).toBe(8)
    const colorSet = new Set<Color>(COLOR_POOL)
    const shapeSet = new Set<Shape>(SHAPE_POOL)
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const round = generateRound(band, seed)
        for (const p of round.prompts) {
          for (const c of p.choices) {
            expect(colorSet.has(c.color)).toBe(true)
            expect(shapeSet.has(c.shape)).toBe(true)
          }
        }
      }
    }
  })

  it('source contains no Math.random() call (purity guard)', () => {
    const src = readFileSync(join(__dirname, 'generator.ts'), 'utf8')
    expect(/Math\.random\s*\(/.test(src)).toBe(false)
  })
})
