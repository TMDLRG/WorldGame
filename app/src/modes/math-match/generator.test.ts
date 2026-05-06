import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { generateRound, type MathRound, type Op } from './generator'
import type { AgeBand } from '../../state/usePreferences'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BANDS: readonly AgeBand[] = ['4-5', '6-7', '8-9']
const SEEDS: readonly number[] = [0, 1, 2, 3, 4]

const CHOICES_PER_BAND: Record<AgeBand, number> = {
  '4-5': 4,
  '6-7': 4,
  '8-9': 5,
}

const ANSWER_RANGE: Record<AgeBand, [number, number]> = {
  '4-5': [1, 5],
  '6-7': [0, 10],
  '8-9': [0, 20],
}

const ALLOWED_OPS: Record<AgeBand, ReadonlySet<Op>> = {
  '4-5': new Set<Op>(['count']),
  '6-7': new Set<Op>(['add', 'sub']),
  '8-9': new Set<Op>(['add', 'sub', 'mul']),
}

describe('OAS-426-T1 Math Match round generator', () => {
  it('produces 5 prompts per round for every age band', () => {
    for (const band of BANDS) {
      const round: MathRound = generateRound(band, 17)
      expect(round.prompts.length, `prompts ${band}`).toBe(5)
    }
  })

  it('choices count per prompt matches age-band sizing', () => {
    for (const band of BANDS) {
      const round = generateRound(band, 0)
      for (const p of round.prompts) {
        expect(p.choices.length, `choices ${band}`).toBe(
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
        expect(b, `det ${band} seed=${seed}`).toEqual(a)
      }
    }
  })

  it('answer is always in choices', () => {
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const round = generateRound(band, seed)
        round.prompts.forEach((p, i) => {
          expect(
            p.choices.includes(p.answer),
            `answer in choices ${band} seed=${seed} i=${i}`,
          ).toBe(true)
        })
      }
    }
  })

  it('choices in a prompt are pairwise distinct', () => {
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const round = generateRound(band, seed)
        round.prompts.forEach((p, i) => {
          const set = new Set(p.choices)
          expect(set.size, `distinct ${band} seed=${seed} i=${i}`).toBe(
            p.choices.length,
          )
        })
      }
    }
  })

  it('per-band op set is respected', () => {
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const round = generateRound(band, seed)
        for (const p of round.prompts) {
          expect(
            ALLOWED_OPS[band].has(p.op),
            `op ${band} seed=${seed} op=${p.op}`,
          ).toBe(true)
        }
      }
    }
  })

  it('all numbers (operands, answer, choices) lie in the allowed answer range for the band', () => {
    for (const band of BANDS) {
      const [min, max] = ANSWER_RANGE[band]
      for (const seed of SEEDS) {
        const round = generateRound(band, seed)
        for (const p of round.prompts) {
          expect(p.left).toBeGreaterThanOrEqual(min)
          expect(p.left).toBeLessThanOrEqual(max)
          if (typeof p.right === 'number') {
            expect(p.right).toBeGreaterThanOrEqual(min)
            expect(p.right).toBeLessThanOrEqual(max)
          }
          expect(p.answer).toBeGreaterThanOrEqual(min)
          expect(p.answer).toBeLessThanOrEqual(max)
          for (const c of p.choices) {
            expect(c).toBeGreaterThanOrEqual(min)
            expect(c).toBeLessThanOrEqual(max)
          }
        }
      }
    }
  })

  it('subtraction never produces a negative answer; counting answer equals left', () => {
    for (const band of BANDS) {
      for (const seed of SEEDS) {
        const round = generateRound(band, seed)
        for (const p of round.prompts) {
          if (p.op === 'sub') expect(p.answer).toBeGreaterThanOrEqual(0)
          if (p.op === 'count') expect(p.answer).toBe(p.left)
        }
      }
    }
  })

  it('source contains no Math.random() call (purity guard)', () => {
    const src = readFileSync(join(__dirname, 'generator.ts'), 'utf8')
    expect(/Math\.random\s*\(/.test(src)).toBe(false)
  })
})
